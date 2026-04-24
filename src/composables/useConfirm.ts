import { ref } from 'vue';

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

const isOpen = ref(false);
const options = ref<ConfirmOptions | null>(null);

let resolver: ((value: boolean) => void) | null = null;

export function useConfirm() {
  function confirm(opts: ConfirmOptions): Promise<boolean> {
    options.value = {
      title: 'Confirm',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      danger: false,
      ...opts,
    };

    isOpen.value = true;

    return new Promise<boolean>((resolve) => {
      resolver = resolve;
    });
  }

  function onConfirm() {
    isOpen.value = false;
    resolver?.(true);
    resolver = null;
  }

  function onCancel() {
    isOpen.value = false;
    resolver?.(false);
    resolver = null;
  }

  function close() {
    onCancel();
  }

  return {
    isOpen,
    options,
    confirm,
    onConfirm,
    onCancel,
    close,
  };
}
