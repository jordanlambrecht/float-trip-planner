// app/components/ConfirmationModal.tsx

import Image from "next/image"
import type { ConfirmationModalProps } from "@types"

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  iconSrc,
}: ConfirmationModalProps) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm'>
      <div className='w-full max-w-md p-6 space-y-2 border rounded-lg shadow-xl bg-gray-cardbg border-gray'>
        <div className='flex items-stretch'>
          <div className='flex items-center justify-center py-2'>
            <Image
              src={iconSrc || "/dead-pixel.png"}
              alt='Confirmation Icon'
              width={33}
              height={33}
              className='relative downRightAndScale'
            />
          </div>

          <div className='flex items-center py-2 grow align-start'>
            <h3 className='ml-2 font-mono text-xl font-semibold text-gray-textdark'>
              {title}
            </h3>
          </div>
        </div>

        <p className='pt-2 font-mono text-sm text-gray-textdark'>{message}</p>
        <div className='flex justify-end pt-4 space-x-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors border rounded-md sm:text-sm border-gray text-gray-textdark bg-gray-cardbg hover:bg-gray-pagebg hover:border-gray-textlight focus:outline-none focus:ring-2 focus:ring-pink-dark focus:ring-offset-2'
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className='px-5 py-2 font-mono text-xs tracking-wider text-white uppercase rounded-md sm:text-sm bg-pink-dark hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-dark focus:ring-offset-2'
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
