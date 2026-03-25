import { useState, useCallback } from 'react';
import { PromptDialog } from '../components/PromptDialog';

/**
 * usePrompt - Promise-based prompt dialog hook
 */
export function usePrompt() {
    const [state, setState] = useState({
        isOpen: false,
        title: '',
        message: '',
        placeholder: '',
        confirmLabel: 'Submit',
        cancelLabel: 'Cancel',
        defaultValue: '',
        resolve: null,
    });

    const prompt = useCallback((options = {}) => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                title: options.title || 'Input Required',
                message: options.message || '',
                placeholder: options.placeholder || 'Type here...',
                confirmLabel: options.confirmLabel || 'Submit',
                cancelLabel: options.cancelLabel || 'Cancel',
                defaultValue: options.defaultValue || '',
                resolve,
            });
        });
    }, []);

    const handleConfirm = useCallback((value) => {
        state.resolve?.(value);
        setState(s => ({ ...s, isOpen: false, resolve: null }));
    }, [state]);

    const handleCancel = useCallback(() => {
        state.resolve?.(null);
        setState(s => ({ ...s, isOpen: false, resolve: null }));
    }, [state]);

    const PromptDialogNode = (
        <PromptDialog
            isOpen={state.isOpen}
            title={state.title}
            message={state.message}
            placeholder={state.placeholder}
            confirmLabel={state.confirmLabel}
            cancelLabel={state.cancelLabel}
            defaultValue={state.defaultValue}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );

    return { prompt, PromptDialogNode };
}
