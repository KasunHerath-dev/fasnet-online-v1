import React, { useState } from 'react';
import { Upload, Folder, HardDrive, CheckCircle2, AlertCircle, ChevronRight, Save, Loader2, Cloud } from 'lucide-react';
import api from '../../services/api';

const GoogleDriveConfig = () => {
  const [jsonFile, setJsonFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [selectedFolder, setSelectedFolder] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setJsonFile(e.target.files[0]);
      setScanResult(null);
      setError(null);
      setSuccess(null);
      setSelectedFolder(null);
    }
  };

  const handleScan = async () => {
    if (!jsonFile) {
      setError("Please select a valid Service Account JSON file first.");
      return;
    }

    setIsScanning(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('credentials', jsonFile);

    try {
      const response = await api.post(
        `/settings/drive/scan`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setScanResult(response.data);
      } else {
        setError(response.data.message || "Failed to scan drive.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred while connecting to Google Drive API.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    if (!scanResult || !selectedFolder) {
      setError("Please scan and select a target folder first.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post(
        `/settings/drive/save`, 
        {
          credentialsRaw: scanResult.credentialsRaw,
          folderId: selectedFolder.id,
          sharedDriveId: selectedFolder.isSharedDrive ? selectedFolder.id : null
        }
      );

      if (response.data.success) {
        setSuccess("Google Drive configuration successfully saved to the server backend! The server may take a few seconds to restart to apply the changes.");
      } else {
        setError(response.data.message || "Failed to save configuration.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred while saving the configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to build a visually indented tree or flat list.
  // For simplicity, we just show a flat list but could highlight Shared vs MyDrive
  const renderFolders = () => {
    if (!scanResult) return null;

    const allItems = [...(scanResult.folders || []), ...(scanResult.drives || [])];

    if (allItems.length === 0) {
      return (
        <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-xl">
          No folders or shared drives found for this service account.
        </div>
      );
    }

    return (
      <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-80 overflow-y-auto">
        <ul className="divide-y divide-slate-100">
          {allItems.map((item) => (
            <li 
              key={item.id}
              onClick={() => setSelectedFolder(item)}
              className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                selectedFolder?.id === item.id 
                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                  : 'hover:bg-slate-50 border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.isSharedDrive ? (
                  <HardDrive className={`w-5 h-5 ${selectedFolder?.id === item.id ? 'text-blue-500' : 'text-purple-500'}`} />
                ) : (
                  <Folder className={`w-5 h-5 ${selectedFolder?.id === item.id ? 'text-blue-500' : 'text-slate-400'}`} />
                )}
                <div>
                  <p className={`font-medium ${selectedFolder?.id === item.id ? 'text-blue-700' : 'text-slate-700'}`}>
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {item.id}</p>
                </div>
              </div>
              {selectedFolder?.id === item.id && (
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Cloud className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">Google Drive Configuration</h3>
          <p className="text-xs text-slate-600">Connect a Service Account JSON to automatically route file uploads to Google Drive.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Step 1: Upload JSON */}
      <div className="mb-6 border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 text-center relative hover:bg-slate-100 transition-colors">
        <input 
          type="file" 
          accept=".json"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        <h4 className="font-semibold text-slate-700 mb-1">
          {jsonFile ? jsonFile.name : "Select Service Account JSON File"}
        </h4>
        <p className="text-xs text-slate-500">
          {jsonFile ? "File selected. Click 'Connect & Scan' to authenticate." : "Drag and drop or click to browse for your .json access key"}
        </p>
      </div>

      {/* Step 2: Connect Button */}
      <div className="flex justify-end mb-8">
        <button
          onClick={handleScan}
          disabled={!jsonFile || isScanning}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
            !jsonFile ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 
            'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
          }`}
        >
          {isScanning ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Scanning Drive...</>
          ) : (
            <>Connect & Scan Drive <ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>

      {/* Step 3: Scan Results & Folder Selection */}
      {scanResult && (
        <div className="mt-8 pt-8 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-sm font-semibold text-slate-700">Authenticated as: <span className="text-blue-600 font-mono text-xs ml-1">{scanResult.account.email}</span></p>
          </div>
          
          <h4 className="font-bold text-slate-900 mb-1">Select Target Target Folder</h4>
          <p className="text-xs text-slate-500">Pick the default folder or Shared Drive where FASNet should upload all future resource files.</p>

          {renderFolders()}

          <div className="mt-6 flex justify-end">
             <button
              onClick={handleSave}
              disabled={!selectedFolder || isSaving}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                !selectedFolder ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 
                'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving Configuration...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Configuration</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleDriveConfig;
