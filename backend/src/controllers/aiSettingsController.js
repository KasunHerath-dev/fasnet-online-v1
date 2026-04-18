const SystemSetting = require('../models/SystemSetting');
const { GoogleGenAI, ThinkingLevel } = require('@google/genai');

/**
 * Get current Gemini API Key (Masked for safety)
 */
exports.getGeminiConfig = async (req, res) => {
    try {
        const setting = await SystemSetting.findOne({ key: 'GEMINI_API_KEY' });
        
        let maskedKey = null;
        if (setting && setting.value) {
            const keyLen = setting.value.length;
            if (keyLen > 10) {
                maskedKey = `${setting.value.slice(0, 5)}...${setting.value.slice(-5)}`;
            } else {
                maskedKey = '**********';
            }
        }

        res.status(200).json({
            success: true,
            data: {
                hasKey: !!(setting && setting.value),
                maskedKey,
                updatedAt: setting ? setting.updatedAt : null
            }
        });
    } catch (err) {
        console.error('[ai-config-get] Error:', err.message);
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

/**
 * Update Gemini API Key
 */
exports.updateGeminiConfig = async (req, res) => {
    try {
        const { apiKey } = req.body;
        if (!apiKey) {
            return res.status(400).json({ success: false, error: { message: 'API Key is required' } });
        }

        // 🛡️ Guard: If the key is masked (e.g., AI...XYZ), the user didn't change it.
        // We skip the update to avoid saving a masked string to the database.
        if (apiKey.includes('...') && apiKey.length < 25) {
            return res.status(200).json({
                success: true,
                message: 'No changes detected (Key remains masked)',
                skipped: true
            });
        }

        let setting = await SystemSetting.findOne({ key: 'GEMINI_API_KEY' });
        if (setting) {
            setting.value = apiKey;
            await setting.save();
        } else {
            setting = await SystemSetting.create({
                key: 'GEMINI_API_KEY',
                value: apiKey,
                description: 'API key for Gemini AI Studio services used in LMS monitoring and resource analysis.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Gemini API Key updated successfully',
            data: { updatedAt: setting.updatedAt }
        });
    } catch (err) {
        console.error('[ai-config-update] Error:', err.message);
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

/**
 * Test Gemini API Key Connection
 */
exports.testGeminiConfig = async (req, res) => {
    try {
        let { apiKey } = req.body;

        if (!apiKey || apiKey.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                error: { message: 'API key is required for testing', code: 'MISSING_KEY' } 
            });
        }

        // 🛡️ Logic: If the key is masked, fetch the ACTUAL key from the database to test it.
        if (apiKey.includes('...') && apiKey.length < 25) {
            const savedSetting = await SystemSetting.findOne({ key: 'GEMINI_API_KEY' });
            if (!savedSetting || !savedSetting.value) {
                return res.status(400).json({ 
                    success: false, 
                    error: { message: 'No saved key found. Please enter a new key first.', code: 'NO_SAVED_KEY' } 
                });
            }
            apiKey = savedSetting.value;
        }

        const ai = new GoogleGenAI({ apiKey });

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: "Respond with ONLY the word 'CONNECTED'.",
                config: {
                    thinkingConfig: {
                        thinkingLevel: ThinkingLevel.LOW
                    }
                }
            });

            if (response.text.includes('CONNECTED')) {
                return res.json({ success: true, message: 'Gemini 2.0 Connection successful!' });
            } else {
                return res.json({ success: false, message: 'AI responded but format was unexpected.' });
            }
        } catch (apiErr) {
            let errorMessage = apiErr.message || 'Gemini API call failed';
            let isQuotaError = false;
            let retrySeconds = null;

            // 🔍 Advanced Error Parsing
            try {
                // If the error message is a JSON string (common in this SDK), parse it
                if (typeof errorMessage === 'string' && errorMessage.startsWith('{')) {
                    const parsed = JSON.parse(errorMessage);
                    if (parsed.error?.status === 'RESOURCE_EXHAUSTED' || parsed.error?.code === 429) {
                        isQuotaError = true;
                        errorMessage = parsed.error.message || errorMessage;
                        
                        // Extract retry delay if present
                        if (parsed.error.details) {
                            const retryInfo = parsed.error.details.find(d => d.retryDelay);
                            if (retryInfo?.retryDelay) {
                                retrySeconds = parseInt(retryInfo.retryDelay);
                            }
                        }
                    }
                }
            } catch (pErr) {
                // Not JSON, continue with string checks
            }

            // Fallback string checks if not already identified
            if (!isQuotaError) {
                if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
                    isQuotaError = true;
                    const retryMatch = errorMessage.match(/retry in ([\d\.]+)s/);
                    if (retryMatch) retrySeconds = Math.ceil(parseFloat(retryMatch[1]));
                }
            }

            if (isQuotaError) {
                const waitMsg = retrySeconds ? ` Please retry in ${retrySeconds}s.` : ' Please wait a moment before retrying.';
                return res.status(429).json({ 
                    success: false, 
                    error: { 
                        message: `Gemini API Quota Exceeded.${waitMsg} (Free Tier limits reached)`, 
                        code: 'QUOTA_EXCEEDED' 
                    } 
                });
            }

            console.error('Gemini API Error:', errorMessage);
            return res.status(400).json({ 
                success: false, 
                error: { message: errorMessage, code: 'API_ERROR' } 
            });
        }
    } catch (error) {
        console.error('AI Test Critical Error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: { message: 'Internal server error during connection test', details: error.message } 
        });
    }
};
