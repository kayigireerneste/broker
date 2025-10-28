import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { InputField } from './InputField'
import { authApi } from '@/lib/axios'
import toast from 'react-hot-toast'

interface OTPModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export default function OTPModal({ isOpen, onClose, email }: OTPModalProps) {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Please enter the OTP')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await toast.promise(
        authApi.verifyOtp({ email, otp }),
        {
          loading: 'Verifying OTP...',
          success: (response) => {
            router.push('/auth/login')
            return response.message || 'Email verified successfully!'
          },
          error: (err) => {
            setError(err.message)
            return err.message || 'Failed to verify OTP'
          }
        }
      )
    } catch (err) {
      console.error('OTP verification error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 text-gray-900 mb-4"
                >
                  Verify Your Email
                </Dialog.Title>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    Please enter the verification code sent to {email}
                  </p>
                  
                  <InputField
                    name="otp"
                    label="Verification Code"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    error={error}
                    disabled={isLoading}
                    placeholder="Enter verification code"
                    required
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="inline-flex justify-center rounded-full border border-[#004B5B]/50 px-4 py-2 text-sm font-medium text-[#004B5B] hover:bg-gray-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#003641' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVerifyOTP}
                    disabled={isLoading}
                    className={`inline-flex justify-center rounded-full border border-transparent px-4 py-2 text-sm font-medium text-white bg-[#004B5B] ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#003641]'}`}
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </motion.button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}