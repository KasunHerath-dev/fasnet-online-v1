import { useState, useCallback } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';

/**
 * useConfirm - Promise-based confirm dialog hook
 *
 * @example
 *   const { confirm, ConfirmDialogNode } = useConfirm();
 *   // In JSX: {ConfirmDialogNode}
 *   // In handler:
 *   const ok = await confirm({
 *       title: 'Delete Resource',
 *       message: 'This cannot be undone.',
 *       type: 'danger',
 *       confirmLabel: 'Delete',
 *   });
 *   if (!ok) return;
 */
export function useConfirm() {
    const [state, setState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'warning',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        resolve: null,
    });

    const confirm = useCallback((options = {}) => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                title: options.title || 'Are you sure?',
                message: options.message || '',
                type: options.type || 'warning',
                confirmLabel: options.confirmLabel || 'Confirm',
                cancelLabel: options.cancelLabel || 'Cancel',
                resolve,
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        state.resolve?.(true);
        setState(s => ({ ...s, isOpen: false, resolve: null }));
    }, [state]);

    const handleCancel = useCallback(() => {
        state.resolve?.(false);
        setState(s => ({ ...s, isOpen: false, resolve: null }));
    }, [state]);

    const ConfirmDialogNode = (
        <ConfirmDialog
            isOpen={state.isOpen}
            title={state.title}
            message={state.message}
            type={state.type}
            confirmLabel={state.confirmLabel}
            cancelLabel={state.cancelLabel}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );

    return { confirm, ConfirmDialogNode };
}
