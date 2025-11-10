import React, { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/axios'
import toast from 'react-hot-toast'

interface OTPModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export default function OTPModal({ isOpen, onClose, email }: OTPModalProps) {
  const router = useRouter()
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')

  const setDigit = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return // only allow single digit
    setDigits((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const focusInput = (index: number) => {
    const el = document.getElementById(`otp-${index}`)
    if (el && el instanceof HTMLElement) el.focus()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.slice(-1) // keep only last char
    if (!/^\d$/.test(val) && val !== '') return
    setDigit(index, val)
    if (val !== '' && index < digits.length - 1) {
      focusInput(index + 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '') {
        if (index > 0) {
          setDigit(index - 1, '')
          focusInput(index - 1)
        }
      } else {
        setDigit(index, '')
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1)
    } else if (e.key === 'ArrowRight' && index < digits.length - 1) {
      focusInput(index + 1)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    let paste = e.clipboardData?.getData('text') || ''

    // Fallback to navigator.clipboard if clipboardData is not available
    if ((!paste || paste === '') && 'clipboard' in navigator) {
      try {
        paste = await navigator.clipboard.readText()
      } catch (err) {
        console.error('Failed to read from navigator.clipboard:', err)
      }
    }

    const onlyDigits = paste.replace(/\D/g, '').slice(0, digits.length)
    if (!onlyDigits) return
    const next = Array(digits.length).fill('')
    for (let i = 0; i < onlyDigits.length; i++) next[i] = onlyDigits[i]
    setDigits(next)
    const nextFocus = Math.min(onlyDigits.length, digits.length - 1)
    focusInput(nextFocus)
  }

  const handleVerifyOTP = async () => {
    const otp = digits.join('')
    if (otp.length !== digits.length) {
      setError('Please enter the full OTP')
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
            const baseMessage = response.message || 'Email verified successfully!'
            return `${baseMessage} Your CSD number is ${response.csdNumber}.`
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

  const handleResendOtp = async () => {
    setIsResending(true)
    setError('')

    try {
      await toast.promise(
        authApi.resendOtp(email),
        {
          loading: 'Resending OTP...',
          success: (response) => {
            const nextDigits = Array(digits.length).fill('')
            setDigits(nextDigits)
            setTimeout(() => focusInput(0), 100)
            return response.message || 'A new OTP has been sent!'
          },
          error: (err) => {
            setError(err.message)
            return err.message || 'Failed to resend OTP'
          }
        }
      )
    } catch (err) {
      console.error('OTP resend error:', err)
    } finally {
      setIsResending(false)
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

                  <div
                    className="flex gap-2 justify-center mb-2"
                    onPaste={handlePaste}
                  >
                    {digits.map((d, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        autoComplete="one-time-code"
                        value={d}
                        onChange={(e) => handleChange(e, i)}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                        disabled={isLoading}
                        className="w-12 h-12 text-center rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B]"
                      />
                    ))}
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <div className="mt-4 text-sm text-gray-500 text-center">
                    <span>Didn&apos;t receive the code?</span>{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading || isResending}
                      className="font-semibold text-[#004B5B] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isResending ? 'Resending...' : 'Resend OTP'}
                    </button>
                  </div>
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