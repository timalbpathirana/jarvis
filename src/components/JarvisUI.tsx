import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import {
  FiX,
  FiUser,
  FiCode,
  FiServer,
  FiCpu,
  FiGlobe,
  FiClock,
  FiExternalLink,
  FiMessageSquare,
  FiSend,
} from 'react-icons/fi'
import { FaLinkedin, FaGithub, FaBrain, FaRobot } from 'react-icons/fa'
import { queryJarvis } from '../services/jarvisApi'

interface HolographicPanel {
  id: string
  title: string
  content: string
  icon: React.ReactNode
  position: { x: number; y: number }
  size: { width: number; height: number }
  color: string
}

const JarvisUI = () => {
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [bootupComplete, setBootupComplete] = useState(false)
  const [bootupText, setBootupText] = useState<string[]>([])
  const [showWelcome, setShowWelcome] = useState(false)
  const [visitorName, setVisitorName] = useState('')
  const [nameSubmitted, setNameSubmitted] = useState(false)
  const [typingEffect, setTypingEffect] = useState('')
  const [typingComplete, setTypingComplete] = useState(false)
  const [bootupProgress, setBootupProgress] = useState(0)
  const [scanLines, setScanLines] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [personalizationProgress, setPersonalizationProgress] = useState(0)
  const [personalizationComplete, setPersonalizationComplete] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)

  // Chat related state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([])
  const [currentMessage, setCurrentMessage] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isJarvisThinking, setIsJarvisThinking] = useState(false)
  const [jarvisInitializing, setJarvisInitializing] = useState(false)
  const [audioVisualization, setAudioVisualization] = useState<number[]>([])
  const [askedQuestions, setAskedQuestions] = useState<string[]>([])

  // Added state for chat welcome screen
  const [showChatWelcome, setShowChatWelcome] = useState(false)

  // API connection status
  const [isOpenAIConnected, setIsOpenAIConnected] = useState(true)
  const [isRagAvailable, setIsRagAvailable] = useState(true)

  // Token usage tracking
  const [tokenUsage, setTokenUsage] = useState({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  })

  // Introduction message
  const introMessage =
    "Hi, I'm Timal's personal AI assistant. I'm here to help you explore his work, mindset, and approach to engineering. Timal built me so you can see not just what he's done, but how he thinks. Curious about anything? Just ask."

  // Define panels with content
  const panels: HolographicPanel[] = [
    {
      id: 'profile',
      title: 'PROFILE',
      content:
        'Timal Pathirana\nSoftware Engineer | AI Enthusiast\nSpecializing in scalable automation, devops culture, and AI-powered product engineering\nAWS AI Certified | Driven by curiosity, clarity, and imagination',
      icon: <FiUser className="text-2xl" />,
      position: { x: 20, y: 20 },
      size: { width: 300, height: 200 },
      color: '#60A5FA',
    },
    {
      id: 'education',
      title: 'EDUCATION',
      content:
        'RMIT University\nBachelor of Information Technology (Web and Mobile Programming)\n2018 - 2021\nCertifications: AWS, ML, & More',
      icon: <FiGlobe className="text-2xl" />,
      position: { x: 20, y: 290 },
      size: { width: 300, height: 180 },
      color: '#34D399',
    },
    {
      id: 'recommendations',
      title: 'RECOMMENDATIONS',
      content:
        'Deidre White (Senior Product Manager): "Timal is an incredible engineer. His ability to take a requirement, analyse it and provide feedback on the best design solutions has helped us to develop great features that are fit for purpose."\n\nIvantha Guruge (Software Engineer): "Timal joined our team as a graduate software engineer and was quick to absorb the development stack. He provided clean code and solutions and was always asking the right questions. Timals strength is being a quick learner."',
      icon: <FiMessageSquare className="text-2xl" />,
      position: { x: 660, y: 530 },
      size: { width: 320, height: 200 },
      color: '#EC4899',
    },
    {
      id: 'career',
      title: 'CAREER',
      content:
        'Zip Co (2022-Present)\nSoftware Engineer\n\nCompass Education (2021-2022)\nJunior Software Engineer',
      icon: <FiServer className="text-2xl" />,
      position: { x: 340, y: 20 },
      size: { width: 300, height: 180 },
      color: '#F472B6',
    },
    {
      id: 'projects',
      title: 'PROJECTS',
      content:
        'EngageAI: ML-powered customer funnel optimization\nZipInstallie: Automated investigation tool\nJARVIS UI: Interactive AI interface\nMonark: Personal finance dashboard',
      icon: <FiCode className="text-2xl" />,
      position: { x: 340, y: 260 },
      size: { width: 300, height: 200 },
      color: '#A78BFA',
    },
    {
      id: 'skills',
      title: 'SKILLS',
      content:
        'Programming: C#, .NET Core, Python, SQL, Postgres\nAI & Machine Learning: LLMs, Hugging Face, XGBoost, AI-driven automation\nCloud & DevOps: AWS (Lambda, S3, DynamoDB, IAM), CI/CD (GitHub Actions), Terraform, Docker\nMonitoring & Observability: Dynatrace, FullStory, AWS CloudWatch\nSoftware Engineering: Microservices, REST APIs, Event-Driven Architecture (Kafka, SNS/SQS), Agile, Test Automation (xUnit, AutoMocker)\nAI Tools: CursorAI, Claude, OpenAI, Supabase, Pinecone, Firebase, LangChain, Vercel',
      icon: <FiCpu className="text-2xl" />,
      position: { x: 660, y: 20 },
      size: { width: 320, height: 390 },
      color: '#FBBF24',
    },
  ]

  // Generate random particles for background effect
  const generateParticles = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
    }))
  }

  const particles = generateParticles(50)

  // Bootup sequence
  useEffect(() => {
    const bootSequence = [
      'INITIALIZING SYSTEM...',
      'LOADING CORE MODULES...',
      'CONNECTING TO OPENAI...',
      'CALIBRATING INTERFACE...',
      'SYSTEM READY',
    ]

    let index = 0
    const interval = setInterval(() => {
      if (index < bootSequence.length) {
        setBootupText((prev) => [...prev, bootSequence[index]])
        setBootupProgress(((index + 1) / bootSequence.length) * 100)
        index++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setBootupComplete(true)
          setTimeout(() => {
            setShowWelcome(true)
            // Remove scan lines effect after boot sequence
            setTimeout(() => {
              setScanLines(false)
            }, 1000)
          }, 500)
        }, 1000)
      }
    }, 600)

    return () => clearInterval(interval)
  }, [])

  // Typing effect for intro message
  useEffect(() => {
    if (showWelcome && !typingComplete) {
      let i = 0
      const typing = setInterval(() => {
        if (i < introMessage.length) {
          setTypingEffect(introMessage.substring(0, i + 1))
          i++
        } else {
          clearInterval(typing)
          setTypingComplete(true)
        }
      }, 20)

      return () => clearInterval(typing)
    }
  }, [showWelcome])

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Animation for the personalization progress
  useEffect(() => {
    if (nameSubmitted && personalizationProgress < 100) {
      const interval = setInterval(() => {
        setPersonalizationProgress((prev) => {
          const newProgress = prev + 1
          if (newProgress >= 100) {
            clearInterval(interval)
            setPersonalizationComplete(true)
            return 100
          }
          return newProgress
        })
      }, 20) // 2000ms / 100 = 20ms per step for a smooth 2-second animation

      return () => clearInterval(interval)
    }
  }, [nameSubmitted, personalizationProgress])

  // Format time as HH:MM:SS
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (visitorName.trim()) {
      setNameSubmitted(true)
    }
  }

  // Scroll to bottom of chat on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      // Only auto-scroll if there are multiple messages (not just the welcome message)
      if (chatMessages.length > 1) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [chatMessages])

  // Handle opening the JARVIS interface with initialization sequence
  const handleOpenJarvis = () => {
    // Show the welcome screen instead of going directly to chat
    setShowChatWelcome(true)
  }

  // Function to proceed from welcome screen to chat interface
  const handleContinueToChat = () => {
    setShowChatWelcome(false)
    setChatOpen(true)
    setJarvisInitializing(true)

    // Simulate JARVIS booting up
    setTimeout(() => {
      setJarvisInitializing(false)
      // Welcome message from JARVIS
      const welcomeMessage = `Hello ${visitorName || 'there'}. How may I assist you today?`
      setChatMessages([
        {
          role: 'assistant',
          content: welcomeMessage,
        },
      ])

      // Generate audio visualization
      simulateAudioVisualization()
    }, 2000)
  }

  // Simulate audio visualization when JARVIS speaks
  const simulateAudioVisualization = () => {
    setAudioVisualization([])
    const interval = setInterval(() => {
      setAudioVisualization(
        Array.from({ length: 20 }, () => Math.random() * 100),
      )
    }, 100)

    setTimeout(() => {
      clearInterval(interval)
      setAudioVisualization([])
    }, 3000)
  }

  // Enhanced message handling
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (currentMessage.trim()) {
      // Add user message
      const updatedMessages = [
        ...chatMessages,
        { role: 'user' as const, content: currentMessage },
      ]

      setChatMessages(updatedMessages)

      // Store message to clear input
      const messageToSend = currentMessage.trim()

      // Clear input
      setCurrentMessage('')

      // Show JARVIS thinking
      setIsJarvisThinking(true)

      try {
        // Create conversation history from all but the last message (which we just added)
        const conversationHistory = updatedMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

        // Reset connection status on new attempt
        setIsOpenAIConnected(true)
        setIsRagAvailable(true)

        // Call the backend API
        const response = await queryJarvis(messageToSend, conversationHistory)

        // Update token usage stats
        if (response.token_usage) {
          setTokenUsage({
            promptTokens: response.token_usage.prompt_tokens || 0,
            completionTokens: response.token_usage.completion_tokens || 0,
            totalTokens: response.token_usage.total_tokens || 0,
          })
        }

        // Add response to chat
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: response.answer,
          },
        ])

        // Simulate voice visualization when JARVIS responds
        simulateAudioVisualization()
      } catch (error) {
        console.error('Error querying JARVIS:', error)

        // Set OpenAI connection as degraded
        setIsOpenAIConnected(false)
        setIsRagAvailable(false)

        // Show error message
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              "I'm having trouble connecting to my knowledge base. Please try again later.",
          },
        ])
      } finally {
        // Hide thinking indicator
        setIsJarvisThinking(false)
      }
    }
  }

  // Suggested questions for recruiters to ask JARVIS
  const suggestedQuestions = [
    'How did Timal build you?',
    'What impact has Timal made in his engineering roles so far?',
    'How does Timal approach team collaboration and psychological safety?',
    "What do performance reviews say about Timal's strengths?",
    'How has Timal applied AI and automation in real engineering contexts?',
    'What motivates Timal as a software engineer beyond just writing code?',
    "What are Timal's interests and values outside of work?",
  ]

  // Function to handle suggested question clicks
  const handleSuggestedQuestion = async (question: string) => {
    // Add to asked questions to track
    setAskedQuestions((prev) => [...prev, question])

    // Add user message
    const updatedMessages = [
      ...chatMessages,
      { role: 'user' as const, content: question },
    ]

    setChatMessages(updatedMessages)

    // Show JARVIS thinking
    setIsJarvisThinking(true)

    try {
      // Create conversation history from all but the last message (which we just added)
      const conversationHistory = updatedMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Reset connection status on new attempt
      setIsOpenAIConnected(true)
      setIsRagAvailable(true)

      // Call the backend API
      const response = await queryJarvis(question, conversationHistory)

      // Update token usage stats
      if (response.token_usage) {
        setTokenUsage({
          promptTokens: response.token_usage.prompt_tokens || 0,
          completionTokens: response.token_usage.completion_tokens || 0,
          totalTokens: response.token_usage.total_tokens || 0,
        })
      }

      // Add response to chat
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.answer },
      ])

      // Simulate voice visualization when JARVIS responds
      simulateAudioVisualization()
    } catch (error) {
      console.error('Error querying JARVIS:', error)

      // Set OpenAI connection as degraded
      setIsOpenAIConnected(false)
      setIsRagAvailable(false)

      // Show error message
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I'm having trouble connecting to my knowledge base. This could be due to API limitations. Please try again later.",
        },
      ])
    } finally {
      // Hide thinking indicator
      setIsJarvisThinking(false)
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-900 font-mono text-cyan-400">
      {/* Background grid and effects */}
      <div className="absolute inset-0">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Radial gradient */}
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-900 opacity-5 blur-3xl" />

        {/* Animated particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-cyan-400"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: Math.random() * 20,
            }}
          />
        ))}

        {/* Scan lines effect */}
        {scanLines && (
          <div
            className="pointer-events-none absolute inset-0 z-50"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(6, 182, 212, 0.03) 0px, rgba(6, 182, 212, 0.03) 1px, transparent 1px, transparent 2px)',
              backgroundSize: '100% 4px',
              animation: 'scanlines 0.5s linear infinite',
            }}
          />
        )}
      </div>

      {/* Boot sequence overlay */}
      <AnimatePresence>
        {!bootupComplete && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900"
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="w-full max-w-md px-8">
              {/* Logo animation */}
              <div className="mb-8 flex justify-center">
                <motion.div
                  className="relative h-32 w-32 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 0 rgba(6, 182, 212, 0.4)',
                      '0 0 30px rgba(6, 182, 212, 0.8)',
                      '0 0 0 rgba(6, 182, 212, 0.4)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-cyan-500"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400"
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                      className="text-4xl font-bold text-cyan-400"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      J
                    </motion.span>
                  </div>
                </motion.div>
              </div>

              {/* Boot progress bar */}
              <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-gray-800">
                <motion.div
                  className="h-full bg-cyan-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${bootupProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Boot messages */}
              <div className="h-48 overflow-hidden text-left">
                {bootupText.map((text, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-2 font-mono text-sm tracking-wider text-cyan-400"
                  >
                    {'> '}
                    {text}
                  </motion.div>
                ))}
              </div>

              {/* System info */}
              <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-cyan-600">
                <div className="flex items-center">
                  <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
                  <span>SYSTEM: JARVIS v2.5.3</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-2 w-2 rounded-full bg-cyan-500" />
                  <span>STATUS: INITIALIZING</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-2 w-2 rounded-full bg-cyan-500" />
                  <span>SECURITY: ENABLED</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
                  <span>NETWORK: CONNECTED</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main interface */}
      {bootupComplete && (
        <div className="relative flex h-full w-full flex-col">
          {/* Header bar - Simplified and cleaner */}
          <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-cyan-900/30 bg-gray-900/80 px-6 backdrop-blur-sm">
            <div className="flex items-center">
              <motion.div
                className="mr-3 h-6 w-6 rounded-full bg-cyan-500"
                animate={{
                  boxShadow: [
                    '0 0 0 rgba(6, 182, 212, 0.4)',
                    '0 0 20px rgba(6, 182, 212, 0.8)',
                    '0 0 0 rgba(6, 182, 212, 0.4)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <h1 className="text-lg font-bold tracking-wider">JARVIS</h1>
            </div>
            <div className="flex items-center space-x-6">
              {/* Streamlined clock display */}
              <div className="flex items-center text-sm">
                <FiClock className="mr-2 text-cyan-500" />
                <span className="font-medium">{formatTime(currentTime)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-xs opacity-70">SYSTEM ONLINE</div>
                <div className="h-2 w-2 rounded-full bg-green-400" />
              </div>
            </div>
          </div>

          {/* Main content area with flex layout */}
          <div className="flex h-[calc(100vh-3.5rem)] w-full pt-4">
            {/* Tech info sidebar - Sticky position */}
            {!showWelcome && (
              <div className="sticky top-14 flex h-[calc(100vh-3.5rem)] w-64 flex-col border-r border-cyan-900/30 bg-gray-900/60 backdrop-blur-sm">
                <div className="scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-cyan-900 flex-grow overflow-y-auto p-4">
                  {/* Enhanced Chat with JARVIS button in sidebar */}
                  <div className="mb-10">
                    <div className="mb-2 text-xs text-cyan-600">
                      AI ASSISTANT
                    </div>
                    <motion.button
                      className="relative flex w-full items-center justify-center gap-2 rounded-md border border-cyan-500 bg-cyan-900/20 px-4 py-3 text-cyan-400 hover:bg-cyan-900/40"
                      onClick={handleOpenJarvis}
                      whileHover={{
                        scale: 1.03,
                      }}
                      whileTap={{ scale: 0.98 }}
                      animate={{
                        boxShadow: [
                          '0 0 5px rgba(6, 182, 212, 0.3)',
                          '0 0 20px rgba(6, 182, 212, 0.7)',
                          '0 0 5px rgba(6, 182, 212, 0.3)',
                        ],
                        borderColor: [
                          'rgba(6, 182, 212, 0.5)',
                          'rgba(6, 182, 212, 1)',
                          'rgba(6, 182, 212, 0.5)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-md opacity-20"
                        animate={{
                          background: [
                            'linear-gradient(90deg, rgba(6, 182, 212, 0) 0%, rgba(6, 182, 212, 0.3) 50%, rgba(6, 182, 212, 0) 100%)',
                            'linear-gradient(90deg, rgba(6, 182, 212, 0) 100%, rgba(6, 182, 212, 0.3) 50%, rgba(6, 182, 212, 0) 0%)',
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute -inset-[2px] rounded-md opacity-50 blur-sm"
                        animate={{
                          opacity: [0.2, 0.5, 0.2],
                          boxShadow: [
                            '0 0 5px 2px rgba(6, 182, 212, 0.3)',
                            '0 0 10px 3px rgba(6, 182, 212, 0.6)',
                            '0 0 5px 2px rgba(6, 182, 212, 0.3)',
                          ],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{ background: 'rgba(6, 182, 212, 0.1)' }}
                      />
                      <FaBrain className="text-lg" />
                      <motion.span
                        animate={{
                          textShadow: [
                            '0 0 3px rgba(6, 182, 212, 0.5)',
                            '0 0 7px rgba(6, 182, 212, 0.8)',
                            '0 0 3px rgba(6, 182, 212, 0.5)',
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Chat with JARVIS
                      </motion.span>
                    </motion.button>
                    <div className="mt-2 flex items-center justify-center">
                      <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      <span className="text-xs text-cyan-600">
                        NEURAL INTERFACE READY
                      </span>
                    </div>
                  </div>

                  {/* Quick links */}
                  <div className="mb-6">
                    <div className="mb-2 text-xs text-cyan-600">
                      QUICK NAVIGATION
                    </div>
                    <div className="space-y-2">
                      {panels.map((panel) => (
                        <div
                          key={panel.id}
                          className="flex cursor-pointer items-center rounded border border-transparent p-2 text-sm hover:border-cyan-800/50 hover:bg-cyan-900/20"
                          onClick={() => setActivePanel(panel.id)}
                        >
                          <div className="mr-2 text-cyan-500">{panel.icon}</div>
                          <div>{panel.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tech footer - remains at bottom of sidebar */}
                <div className="border-t border-cyan-900/30 p-4">
                  <div className="text-center text-xs text-cyan-600">
                    Running in:{' '}
                    {navigator.userAgent.includes('Mac')
                      ? 'macOS'
                      : navigator.userAgent.includes('Win')
                        ? 'Windows'
                        : navigator.userAgent.includes('Linux')
                          ? 'Linux'
                          : 'Unknown OS'}
                  </div>
                </div>
              </div>
            )}

            {/* Welcome message with AI assistant interaction */}
            <AnimatePresence>
              {showWelcome && (
                <motion.div
                  className="absolute inset-0 z-20 flex items-center justify-center px-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                >
                  {!nameSubmitted ? (
                    <motion.div
                      className="w-full max-w-2xl rounded-lg border border-cyan-500/30 bg-gray-900/80 p-8 backdrop-blur-md"
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                    >
                      <div className="mb-8 flex items-center">
                        <motion.div
                          className="relative mr-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-cyan-500"
                          animate={{
                            boxShadow: [
                              '0 0 0 rgba(6, 182, 212, 0.4)',
                              '0 0 30px rgba(6, 182, 212, 0.6)',
                              '0 0 0 rgba(6, 182, 212, 0.4)',
                            ],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <motion.span
                            className="text-2xl font-bold"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            J
                          </motion.span>
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                        </motion.div>

                        <div className="flex-1">
                          <div className="mb-1 flex items-center">
                            <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
                            <div className="text-xs text-cyan-500">
                              AI ASSISTANT ONLINE
                            </div>
                          </div>
                          <div className="text-xs text-cyan-600">v2.5.3</div>
                        </div>
                      </div>

                      <div className="mb-8 text-left">
                        <div className="border-l-2 border-cyan-500 py-1 pl-4">
                          <p className="text-cyan-100">{typingEffect}</p>
                          {typingEffect.length === introMessage.length && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                            >
                              <p className="mt-6 text-cyan-300">
                                May I know your name?
                              </p>
                              <p className="mt-2 text-xs italic text-gray-400">
                                This app only asks for your name to personalize
                                the experience. No data is stored, tracked, or
                                shared — everything stays in your browser
                                session.
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {typingComplete && (
                        <motion.form
                          onSubmit={handleNameSubmit}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 }}
                          className="mt-6"
                        >
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={visitorName}
                              onChange={(e) => setVisitorName(e.target.value)}
                              placeholder="Enter your name"
                              className="mr-4 flex-1 rounded border border-cyan-500 bg-gray-900/60 px-4 py-2 text-cyan-100 focus:border-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-300"
                              required
                            />
                            <motion.button
                              type="submit"
                              className="rounded border border-cyan-500 bg-cyan-500/10 px-6 py-2 text-cyan-400 hover:bg-cyan-500/20"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Continue
                            </motion.button>
                          </div>

                          <div className="mt-8 flex items-center justify-center space-x-2 text-xs text-cyan-600">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
                            <div>
                              VOICE RECOGNITION OFFLINE • TEXT INPUT REQUIRED
                            </div>
                          </div>
                        </motion.form>
                      )}

                      {/* Decorative corner elements */}
                      <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-cyan-500" />
                      <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-cyan-500" />
                      <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-cyan-500" />
                      <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-cyan-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      className="w-full max-w-2xl rounded-lg border border-cyan-500/30 bg-gray-900/80 p-8 backdrop-blur-md"
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                      >
                        <div className="mb-8 flex justify-center">
                          <motion.div
                            className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-cyan-500"
                            animate={{
                              boxShadow: [
                                '0 0 0 rgba(6, 182, 212, 0.4)',
                                '0 0 40px rgba(6, 182, 212, 0.6)',
                                '0 0 0 rgba(6, 182, 212, 0.4)',
                              ],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <motion.div
                              className="text-4xl"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              J
                            </motion.div>
                          </motion.div>
                        </div>

                        <h2 className="mb-2 text-center text-4xl font-light">
                          Welcome, {visitorName}
                        </h2>
                        <p className="text-center text-lg text-cyan-300">
                          It's a pleasure to meet you.
                        </p>
                        <p className="mt-4 text-center text-cyan-100">
                          I'm ready to guide you through Timal's professional
                          journey.
                        </p>

                        {/* Personalization Progress Bar */}
                        <div className="mt-8 w-full">
                          <div className="mb-2 flex justify-between text-xs text-cyan-400">
                            <span>Personalizing Interface</span>
                            <span>{personalizationProgress}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                            <motion.div
                              className="h-full bg-cyan-500"
                              initial={{ width: '0%' }}
                              animate={{ width: `${personalizationProgress}%` }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                        </div>

                        <div className="mt-8 flex justify-center">
                          <motion.button
                            className={`rounded border border-cyan-500 px-8 py-3 text-cyan-400 ${
                              personalizationComplete
                                ? 'bg-cyan-500/10 hover:bg-cyan-500/20'
                                : 'cursor-not-allowed bg-cyan-500/5 opacity-50'
                            }`}
                            onClick={() =>
                              personalizationComplete && setShowWelcome(false)
                            }
                            whileHover={
                              personalizationComplete ? { scale: 1.05 } : {}
                            }
                            whileTap={
                              personalizationComplete ? { scale: 0.95 } : {}
                            }
                            disabled={!personalizationComplete}
                          >
                            Access JARVIS Interface
                          </motion.button>
                        </div>

                        <AnimatePresence>
                          {personalizationComplete && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5 }}
                              className="mt-6 flex items-center justify-center space-x-2 text-xs text-cyan-600"
                            >
                              <div className="h-2 w-2 rounded-full bg-cyan-500" />
                              <div>PERSONALIZED INTERFACE READY</div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Decorative corner elements */}
                        <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-cyan-500" />
                        <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-cyan-500" />
                        <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-cyan-500" />
                        <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-cyan-500" />
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main content area with holographic panels */}
            {!showWelcome && (
              <div className="relative flex-1 overflow-auto p-4 pt-8">
                {/* Grid container for panels */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {panels.map((panel) => (
                    <motion.div
                      key={panel.id}
                      className="rounded border border-cyan-500/30 bg-gray-900/60 backdrop-blur-sm"
                      style={{
                        boxShadow: `0 0 15px ${panel.color}33`,
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: Math.random() * 0.5 }}
                      whileHover={{
                        boxShadow: `0 0 20px ${panel.color}66`,
                        borderColor: `${panel.color}66`,
                      }}
                      onClick={() => setActivePanel(panel.id)}
                    >
                      {/* Panel header */}
                      <div
                        className="flex items-center justify-between border-b border-cyan-800/30 px-4 py-1.5"
                        style={{ backgroundColor: `${panel.color}11` }}
                      >
                        <div className="flex items-center">
                          <div className="mr-2 text-cyan-500">{panel.icon}</div>
                          <h3
                            className="font-bold tracking-wider"
                            style={{ color: panel.color }}
                          >
                            {panel.title}
                          </h3>
                        </div>
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 rounded-full bg-cyan-500/50" />
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: panel.color }}
                          />
                        </div>
                      </div>

                      {/* Panel content */}
                      <div className="p-4">
                        <div
                          className="mb-2 h-1 w-1/3"
                          style={{ backgroundColor: panel.color }}
                        />
                        <pre className="scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-cyan-900 max-h-24 overflow-y-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-cyan-100">
                          {panel.content}
                        </pre>
                      </div>

                      {/* Panel footer with decorative elements */}
                      <div className="flex justify-between px-4 py-1 text-xs text-cyan-600">
                        <div>ID: {panel.id.toUpperCase()}</div>
                        <div>STATUS: ACTIVE</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* User greeting */}
                {visitorName && (
                  <div className="mt-6 flex items-center space-x-2 text-xs text-cyan-300">
                    <div>USER: {visitorName.toUpperCase()}</div>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed panel view - Keep this outside the flex layout */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-4xl rounded-lg border border-cyan-500/50 bg-gray-900/90 p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                boxShadow: `0 0 30px ${panels.find((p) => p.id === activePanel)?.color}33`,
              }}
            >
              <button
                onClick={() => setActivePanel(null)}
                className="absolute right-4 top-4 text-cyan-400 hover:text-cyan-300"
              >
                <FiX size={24} />
              </button>

              <h2
                className="mb-4 text-3xl font-bold tracking-wider"
                style={{
                  color: panels.find((p) => p.id === activePanel)?.color,
                }}
              >
                {panels.find((p) => p.id === activePanel)?.title}
              </h2>

              <div
                className="mb-6 h-1 w-1/4"
                style={{
                  backgroundColor: panels.find((p) => p.id === activePanel)
                    ?.color,
                }}
              />

              <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden pr-2">
                {activePanel === 'profile' ? (
                  <div className="text-cyan-100">
                    <div className="mb-6 flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0">
                      <div className="md:w-1/2">
                        <h3 className="text-2xl font-bold text-cyan-400">
                          Timal Pathirana
                        </h3>
                        <p className="text-lg text-cyan-300">
                          Software Engineer | AI Enthusiast
                        </p>
                        <p className="mt-2 text-cyan-200">
                          Specializing in scalable automation, devops culture,
                          and AI-powered product engineering
                        </p>
                        <p className="mt-1 text-cyan-200">
                          AWS AI Certified | Driven by curiosity, clarity, and
                          imagination
                        </p>

                        <div className="mt-4 flex space-x-4">
                          <motion.a
                            href="https://www.linkedin.com/in/timalpathirana/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center rounded-md border border-cyan-600 bg-cyan-900/30 px-4 py-2 text-cyan-400 transition-all hover:bg-cyan-800/50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaLinkedin className="mr-2 text-lg" />
                            <span>LinkedIn</span>
                            <FiExternalLink className="ml-2 text-sm opacity-70" />
                          </motion.a>
                          <motion.a
                            href="https://github.com/timalbpathirana"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center rounded-md border border-cyan-600 bg-cyan-900/30 px-4 py-2 text-cyan-400 transition-all hover:bg-cyan-800/50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaGithub className="mr-2 text-lg" />
                            <span>GitHub</span>
                            <FiExternalLink className="ml-2 text-sm opacity-70" />
                          </motion.a>
                        </div>
                      </div>

                      {/* Video section */}
                      <div className="md:w-1/2">
                        <div className="group relative overflow-hidden rounded-lg border border-cyan-700/50 bg-gray-900/70 pt-[56.25%] shadow-lg">
                          {/* Animated glow effect */}
                          <motion.div
                            className="absolute inset-0 -z-10 opacity-60"
                            animate={{
                              boxShadow: [
                                'inset 0 0 20px rgba(6, 182, 212, 0.3)',
                                'inset 0 0 40px rgba(6, 182, 212, 0.5)',
                                'inset 0 0 20px rgba(6, 182, 212, 0.3)',
                              ],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                          />

                          <iframe
                            className="absolute left-0 top-0 h-full w-full"
                            src={`https://www.youtube.com/embed/Uv5nTwtaYm8?autoplay=${videoPlaying ? '1' : '0'}&enablejsapi=1&fs=0&mute=1`}
                            title="A timelapse of my coding projects"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen={false}
                          ></iframe>

                          {/* Play button overlay - only show if not playing */}
                          {!videoPlaying && (
                            <div
                              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-gray-900/30 transition-opacity duration-300 hover:bg-gray-900/20"
                              onClick={() => setVideoPlaying(true)}
                            >
                              <motion.div
                                className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/80 text-white shadow-lg"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-8 w-8"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </motion.div>
                            </div>
                          )}

                          {/* Decorative elements */}
                          <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-cyan-500"></div>
                          <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-cyan-500"></div>
                          <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-cyan-500"></div>
                          <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-cyan-500"></div>
                        </div>

                        <div className="mt-2 flex flex-col items-center justify-center text-center">
                          <div className="flex items-center">
                            <div
                              className={`mr-2 h-1.5 w-1.5 rounded-full bg-cyan-500 ${videoPlaying ? 'animate-none' : 'animate-pulse'}`}
                            ></div>
                            <span className="text-xs text-cyan-500">
                              {videoPlaying
                                ? 'NOW PLAYING'
                                : 'A usual afternoon in my happy place'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="mb-2 text-xl font-semibold text-cyan-400">
                        Objective
                      </h4>
                      <p className="leading-relaxed">
                        Software Engineer with a passion for building
                        AI-powered, scalable systems using C#/.NET, Python, and
                        AWS. Skilled in prompt engineering, LLM integration, and
                        deploying real-world generative AI solutions.
                        Comfortable working with tools like OpenAI, Claude, and
                        Pinecone, and exploring frameworks like LangChain
                        through hands-on experimentation. Strong focus on
                        backend architecture, automation, and cloud engineering.
                        AWS Certified AI Practitioner, continuously learning and
                        building systems that deliver meaningful business
                        outcomes.
                      </p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 border-t border-cyan-800/30 pt-6">
                      <div>
                        <div className="mb-1 text-sm text-cyan-500">
                          Key Focus Areas
                        </div>
                        <ul className="list-disc pl-5 text-sm">
                          <li>Generative AI & Prompt Engineering</li>
                          <li>Backend Development (C# / .NET)</li>
                          <li>Cloud Automation (AWS)</li>
                          <li>Scalable System Design</li>
                          <li>LLM Integration & Tooling</li>
                        </ul>
                      </div>
                      <div>
                        <div className="mb-1 text-sm text-cyan-500">
                          Tech Stack
                        </div>
                        <ul className="list-disc pl-5 text-sm">
                          <li>C# / .NET Core</li>
                          <li>Python (FastAPI, scripting)</li>
                          <li>AWS (Lambda, S3, RDS, Step Functions)</li>
                          <li>SQL / PostgreSQL</li>
                          <li>Generative AI (OpenAI, Claude, Pinecone)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : activePanel === 'education' ? (
                  <div className="text-cyan-100">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-cyan-400">
                        University Education
                      </h3>
                      <p className="text-lg text-cyan-300">
                        Bachelor of Information Technology (Web and Mobile
                        Programming)
                      </p>
                      <p className="mt-2 text-cyan-200">
                        RMIT University, Melbourne
                      </p>
                      <p className="mt-1 text-cyan-200">2018 - 2021</p>
                    </div>

                    <div className="mt-8 border-t border-cyan-800/30 pt-6">
                      <h4 className="mb-4 text-xl font-semibold text-cyan-400">
                        Certifications
                      </h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-4">
                          <h5 className="mb-2 font-bold text-cyan-300">
                            AWS Certified AI Practitioner
                          </h5>
                          <motion.a
                            href="https://www.credly.com/earner/earned/badge/84821f28-88f7-49e3-80d2-a63208ca55d7"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center rounded-md border border-cyan-600 bg-cyan-900/30 px-3 py-1 text-sm text-cyan-400 transition-all hover:bg-cyan-800/50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiExternalLink className="mr-2" />
                            <span>View Credential</span>
                          </motion.a>
                        </div>
                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-4">
                          <h5 className="mb-2 font-bold text-cyan-300">
                            AWS Certified AI Practitioner Early Adopter
                          </h5>
                          <motion.a
                            href="https://www.credly.com/earner/earned/badge/320eb3dd-799b-4875-9862-fe5c75044ee2"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center rounded-md border border-cyan-600 bg-cyan-900/30 px-3 py-1 text-sm text-cyan-400 transition-all hover:bg-cyan-800/50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiExternalLink className="mr-2" />
                            <span>View Credential</span>
                          </motion.a>
                        </div>
                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-4">
                          <h5 className="mb-2 font-bold text-cyan-300">
                            Diversity Matters - RMIT University
                          </h5>
                          <motion.a
                            href="https://www.credly.com/earner/earned/badge/6ab1f704-4d73-45c6-a76b-9dc77dba14c6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center rounded-md border border-cyan-600 bg-cyan-900/30 px-3 py-1 text-sm text-cyan-400 transition-all hover:bg-cyan-800/50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiExternalLink className="mr-2" />
                            <span>View Credential</span>
                          </motion.a>
                        </div>
                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-4">
                          <h5 className="mb-2 font-bold text-cyan-300">
                            Supervised Machine Learning: Regression and
                            Classification
                          </h5>
                          <p className="mb-2 text-xs text-cyan-400">
                            DeepLearning.AI & Stanford University
                          </p>
                          <motion.a
                            href="https://www.coursera.org/account/accomplishments/verify/Q7TV4RRALJ36"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center rounded-md border border-cyan-600 bg-cyan-900/30 px-3 py-1 text-sm text-cyan-400 transition-all hover:bg-cyan-800/50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiExternalLink className="mr-2" />
                            <span>View Credential</span>
                          </motion.a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activePanel === 'recommendations' ? (
                  <div className="text-cyan-100">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-cyan-400">
                        Professional Recommendations
                      </h3>
                      <p className="mt-2 text-cyan-200">
                        Endorsements from colleagues and managers
                      </p>

                      <div className="mt-6 space-y-6">
                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-4">
                          <div className="mb-3 flex items-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-800 font-bold text-cyan-200">
                              DW
                            </div>
                            <div className="ml-3">
                              <h5 className="font-bold text-cyan-300">
                                Deidre White
                              </h5>
                              <p className="text-xs text-cyan-400">
                                Senior Product Manager/Product Owner CSPO®
                              </p>
                              <p className="text-xs text-cyan-500">
                                May 29, 2022 · Directly managed Timal
                              </p>
                            </div>
                          </div>
                          <blockquote className="border-l-2 border-cyan-500 pl-4 italic text-cyan-200">
                            "Timal is an incredible engineer. His ability to
                            take a requirement, analyse it and provide feedback
                            on the best design solutions has helped us to
                            develop great features that are fit for purpose.
                            Timal's back end experience has also been extremely
                            beneficial to the team, the intricacies of the
                            system can make It hard to get across everything,
                            but his patience in understanding the issue and
                            asking questions means he is able to deliver what we
                            need. Timal would be a great asset to any team; it's
                            been a pleasure working with him."
                          </blockquote>
                        </div>

                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-4">
                          <div className="mb-3 flex items-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-800 font-bold text-cyan-200">
                              IG
                            </div>
                            <div className="ml-3">
                              <h5 className="font-bold text-cyan-300">
                                Ivantha Guruge
                              </h5>
                              <p className="text-xs text-cyan-400">
                                Software Engineer at Compass Education
                              </p>
                              <p className="text-xs text-cyan-500">
                                May 27, 2022 · Was senior to Timal
                              </p>
                            </div>
                          </div>
                          <blockquote className="border-l-2 border-cyan-500 pl-4 italic text-cyan-200">
                            "Timal joined our team as a graduate software
                            engineer and was quick to absorb the development
                            stack. He provided clean code and solutions and was
                            always asking the right questions. Timals strength
                            is being a quick learner and applying his knowledge
                            effectively. Timal became a good friend and work
                            colleague over time and became an integral part of
                            the team. Wishing him all the very best in his
                            future endeavours 😃"
                          </blockquote>
                        </div>
                      </div>

                      <motion.a
                        href="https://www.linkedin.com/in/timalpathirana/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center rounded-md border border-cyan-600 bg-cyan-900/30 px-4 py-2 text-cyan-400 transition-all hover:bg-cyan-800/50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaLinkedin className="mr-2 text-lg" />
                        <span>View more recommendations on LinkedIn</span>
                        <FiExternalLink className="ml-2 text-sm opacity-70" />
                      </motion.a>
                    </div>
                  </div>
                ) : activePanel === 'career' ? (
                  <div className="text-cyan-100">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-cyan-400">
                        Career Journey
                      </h3>
                      <p className="mt-2 text-cyan-200">
                        Professional experience and achievements
                      </p>

                      {/* Current position */}
                      <div className="mt-8 space-y-6">
                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-6">
                          <div className="mb-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xl font-bold text-cyan-300">
                                Software Engineer (C#/ .NET Core/ AWS)
                              </h4>
                              <span className="rounded-full border border-cyan-500/50 bg-cyan-900/50 px-3 py-1 text-xs text-cyan-300">
                                Current
                              </span>
                            </div>
                            <p className="text-cyan-400">Zip Co - Sydney</p>
                            <p className="text-sm text-cyan-500">
                              November 2022 - Present
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <h5 className="mb-2 font-medium text-cyan-300">
                                Real-Time Data Engineering
                              </h5>
                              <p className="text-sm text-cyan-100">
                                Led the end-to-end implementation of Change Data
                                Capture (CDC) for the application database,
                                enabling real-time streaming into Snowflake.
                                Delivered technical spikes, wrote custom
                                PostgreSQL scripts, and managed a high-risk RDS
                                reboot. Built robust monitoring pipelines and
                                dashboards to support quarterly OKRs and future
                                AI-driven analytics at Zip.
                              </p>
                            </div>

                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <h5 className="mb-2 font-medium text-cyan-300">
                                Automation & Productivity
                              </h5>
                              <p className="text-sm text-cyan-100">
                                Developed Zip-Installie, an internal automation
                                tool that diagnosed installment issues using
                                logs and business rules. Integrated with JIRA
                                and Slack, saving 64+ engineering hours per
                                month and earning the Seamless Zip Award.
                              </p>
                            </div>

                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <h5 className="mb-2 font-medium text-cyan-300">
                                Revenue Recovery
                              </h5>
                              <p className="text-sm text-cyan-100">
                                Resolved the “Installment Stuck” issue,
                                recovering ~$180K. Conducted root cause analysis
                                using Athena SQL and pgAdmin, built fix/rollback
                                scripts, and deployed a Slackbot for early
                                detection and alerting.
                              </p>
                            </div>

                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <h5 className="mb-2 font-medium text-cyan-300">
                                Feature Development
                              </h5>
                              <p className="text-sm text-cyan-100">
                                Delivered the Historic Statement Feature with
                                zero incidents. Handled end-to-end delivery:
                                backend development in C#/.NET, compliance
                                collaboration, SQL data retrieval, code
                                refactoring, and Dynatrace dashboard creation.
                                Recognized at ANZ Town Hall.
                              </p>
                            </div>

                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <h5 className="mb-2 font-medium text-cyan-300">
                                Technical Support Excellence
                              </h5>
                              <p className="text-sm text-cyan-100">
                                Resolved 183+ technical support tickets while
                                keeping the backlog below 20. Enhanced triaging
                                with Zip-Installie’s JIRA dashboards. Introduced
                                structured root cause investigations, reducing
                                repeat issues and SLA breaches.
                              </p>
                            </div>

                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <h5 className="mb-2 font-medium text-cyan-300">
                                Code Optimization & Observability
                              </h5>
                              <p className="text-sm text-cyan-100">
                                Refactored statement logic using the Strategy
                                Pattern, reducing coupling and improving
                                testability. Raised test coverage above 80%,
                                optimized AWS Step Functions, Lambda variables,
                                and enhanced log ingestion into Dynatrace for
                                better observability.
                              </p>
                            </div>

                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <h5 className="mb-2 font-medium text-cyan-300">
                                Team Culture & Leadership
                              </h5>
                              <p className="text-sm text-cyan-100">
                                Championed psychological safety and inclusive
                                communication. Applied frameworks from the
                                "Fostering Psychological Safety & Belonging"
                                course (Udemy, Nov 2023) to improve team
                                onboarding, collaboration, and trust.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Previous position */}
                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-6">
                          <div className="mb-4">
                            <h4 className="text-xl font-bold text-cyan-300">
                              Junior Software Engineer (C#/ .NET Framework)
                            </h4>
                            <p className="text-cyan-400">
                              Compass Education - Hawthorn, Melbourne
                            </p>
                            <p className="text-sm text-cyan-500">
                              June 2021 - November 2022
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <p className="text-sm text-cyan-100">
                                Developed attendance & calendar integrations,
                                including an Azure data writeback service for
                                NSW's Education Department.
                              </p>
                            </div>

                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <p className="text-sm text-cyan-100">
                                Designed and deployed School Marketplace,
                                enabling schools to integrate external tools via
                                Webflow, HubSpot, and Iframes.
                              </p>
                            </div>

                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <p className="text-sm text-cyan-100">
                                Enhanced attendance consolidation & reporting
                                services, supporting AU, NZ, UK, and Ireland
                                school systems.
                              </p>
                            </div>

                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <p className="text-sm text-cyan-100">
                                Upgraded iCal Sync to sync Google Calendar with
                                Compass for better scheduling automation.
                              </p>
                            </div>

                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <p className="text-sm text-cyan-100">
                                Mentored new graduates, leading onboarding
                                sessions & knowledge-sharing meetings.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-center">
                        <motion.a
                          href="https://www.linkedin.com/in/timalpathirana/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-md border border-cyan-600 bg-cyan-900/30 px-4 py-2 text-cyan-400 transition-all hover:bg-cyan-800/50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaLinkedin className="mr-2 text-lg" />
                          <span>View complete profile on LinkedIn</span>
                          <FiExternalLink className="ml-2 text-sm opacity-70" />
                        </motion.a>
                      </div>
                    </div>
                  </div>
                ) : activePanel === 'projects' ? (
                  <div className="text-cyan-100">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-cyan-400">
                        Projects Portfolio
                      </h3>
                      <p className="mt-2 text-cyan-200">
                        Showcase of technical achievements and innovations
                      </p>

                      <div className="mt-8 space-y-8">
                        {/* EngageAI Project */}
                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-6">
                          <div className="mb-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xl font-bold text-cyan-300">
                                EngageAI – Customer Funnel Optimization
                              </h4>
                              <span className="rounded-full border border-purple-500/50 bg-purple-900/30 px-3 py-1 text-xs text-purple-300">
                                Zip Project
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-cyan-400">
                              AI-Powered Machine Learning Solution
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <p className="text-sm text-cyan-100">
                                Built a machine learning model to predict user
                                drop-off risks in real time, optimizing A/B
                                testing.
                              </p>
                            </div>
                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <p className="text-sm text-cyan-100">
                                Designed and developed the entire AI pipeline,
                                from data engineering (Snowflake SQL, feature
                                engineering) to model training (XGBoost,
                                multi-class classification) and real-time
                                inference (FastAPI).
                              </p>
                            </div>
                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <p className="text-sm text-cyan-100">
                                Validated by leadership for its business impact
                                and potential AI-driven growth insights.
                              </p>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                Machine Learning
                              </span>
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                XGBoost
                              </span>
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                Snowflake
                              </span>
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                FastAPI
                              </span>
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                SQL
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ZipInstallie Project */}
                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-6">
                          <div className="mb-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xl font-bold text-cyan-300">
                                ZipInstallie – Automated Investigation Tool
                              </h4>
                              <span className="rounded-full border border-purple-500/50 bg-purple-900/30 px-3 py-1 text-xs text-purple-300">
                                Zip Engineering Tools
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-cyan-400">
                              Engineering Process Optimization
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <p className="text-sm text-cyan-100">
                                Designed and deployed ZipInstallie, an automated
                                tool for investigating instalment-related
                                support tickets, saving 64+ engineering hours
                                monthly.
                              </p>
                            </div>
                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <p className="text-sm text-cyan-100">
                                Streamlined troubleshooting processes, reducing
                                response time and improving efficiency for
                                support engineers.
                              </p>
                            </div>
                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <p className="text-sm text-cyan-100">
                                Earned the Seamless Zip Award for innovation and
                                impact in improving engineering workflows.
                              </p>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                Automation
                              </span>
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                .NET
                              </span>
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                C#
                              </span>
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                AWS
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* JARVIS UI Project */}
                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-6">
                          <div className="mb-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xl font-bold text-cyan-300">
                                JARVIS UI – Interactive AI Interface
                              </h4>
                              <span className="rounded-full border border-cyan-500/50 bg-cyan-900/30 px-3 py-1 text-xs text-cyan-300">
                                Current Project
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-cyan-400">
                              AI-Enhanced Resume Experience
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <p className="text-sm text-cyan-100">
                                Created an immersive, interactive AI interface
                                inspired by Iron Man's JARVIS to showcase skills
                                and experience to recruiters in an innovative
                                format.
                              </p>
                            </div>
                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <p className="text-sm text-cyan-100">
                                Built with React, TypeScript, and Framer Motion
                                to create fluid animations and a futuristic UI
                                that demonstrates frontend capabilities.
                              </p>
                            </div>
                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <p className="text-sm text-cyan-100">
                                Integrated OpenAI capabilities to allow visitors
                                to interact directly with an AI assistant that
                                can provide detailed information about skills,
                                experiences, and projects.
                              </p>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                React
                              </span>
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                TypeScript
                              </span>
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                Framer Motion
                              </span>
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                OpenAI
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Monark Project */}
                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-6">
                          <div className="mb-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xl font-bold text-cyan-300">
                                Monark – Personal Finance Dashboard
                              </h4>
                              <span className="rounded-full border border-green-500/50 bg-green-900/30 px-3 py-1 text-xs text-green-300">
                                Personal Project
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-cyan-400">
                              Full-Stack Creator
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <p className="text-sm text-cyan-100">
                                Monark is a personal finance and wealth-building
                                dashboard designed for first-home buyers and
                                ambitious savers, tracking savings momentum,
                                debt payoff, monthly cashflow, and home loan
                                readiness.
                              </p>
                            </div>
                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <h5 className="mb-2 font-medium text-cyan-300">
                                Key Features
                              </h5>
                              <ul className="list-disc pl-5 text-sm text-cyan-100">
                                <li>
                                  AcquireOS: Property affordability, LVR, DTI,
                                  equity, refinance readiness
                                </li>
                                <li>
                                  SaverOS: Expense categorization, loan
                                  tracking, monthly surplus forecasting
                                </li>
                                <li>
                                  Smart Visuals: Cashflow charts, savings goals,
                                  loan health indicators
                                </li>
                                <li>
                                  Modern Stack: Firebase-auth, Firestore sync,
                                  Material UI, GitHub CI, Vercel deploy
                                </li>
                              </ul>
                            </div>
                            <div className="rounded border border-cyan-800/20 bg-cyan-900/5 p-3">
                              <h5 className="mb-2 font-medium text-cyan-300">
                                Why I Built It
                              </h5>
                              <p className="text-sm text-cyan-100">
                                As a software engineer navigating Australia's
                                housing market, I wanted a tool that felt
                                empowering, clean, and deeply personal —
                                something that makes finance feel intuitive, not
                                overwhelming.
                              </p>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                React
                              </span>
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                TypeScript
                              </span>
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                Firebase
                              </span>
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                Material UI
                              </span>
                              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">
                                Vercel
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-center">
                        <motion.a
                          href="https://github.com/timalbpathirana"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-md border border-cyan-600 bg-cyan-900/30 px-4 py-2 text-cyan-400 transition-all hover:bg-cyan-800/50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaGithub className="mr-2 text-lg" />
                          <span>Explore more projects on GitHub</span>
                          <FiExternalLink className="ml-2 text-sm opacity-70" />
                        </motion.a>
                      </div>
                    </div>
                  </div>
                ) : activePanel === 'skills' ? (
                  <div className="text-cyan-100">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-cyan-400">
                        Technical Skills & Competencies
                      </h3>
                      <p className="mt-2 text-cyan-200">
                        Professional capabilities and technical expertise
                      </p>

                      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-4">
                          <h4 className="mb-3 text-lg font-bold text-yellow-400">
                            Programming
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-yellow-900/40 px-3 py-1 text-sm text-yellow-300">
                              C#
                            </span>
                            <span className="rounded-full bg-yellow-900/40 px-3 py-1 text-sm text-yellow-300">
                              .NET Core
                            </span>
                            <span className="rounded-full bg-yellow-900/40 px-3 py-1 text-sm text-yellow-300">
                              Python
                            </span>
                            <span className="rounded-full bg-yellow-900/40 px-3 py-1 text-sm text-yellow-300">
                              SQL
                            </span>
                            <span className="rounded-full bg-yellow-900/40 px-3 py-1 text-sm text-yellow-300">
                              Postgres
                            </span>
                          </div>
                        </div>

                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-4">
                          <h4 className="mb-3 text-lg font-bold text-purple-400">
                            AI & Machine Learning
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-purple-900/40 px-3 py-1 text-sm text-purple-300">
                              LLMs
                            </span>
                            <span className="rounded-full bg-purple-900/40 px-3 py-1 text-sm text-purple-300">
                              Hugging Face
                            </span>
                            <span className="rounded-full bg-purple-900/40 px-3 py-1 text-sm text-purple-300">
                              XGBoost
                            </span>
                            <span className="rounded-full bg-purple-900/40 px-3 py-1 text-sm text-purple-300">
                              AI-driven automation
                            </span>
                          </div>
                        </div>

                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-4">
                          <h4 className="mb-3 text-lg font-bold text-blue-400">
                            Cloud & DevOps
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-blue-900/40 px-3 py-1 text-sm text-blue-300">
                              AWS Lambda
                            </span>
                            <span className="rounded-full bg-blue-900/40 px-3 py-1 text-sm text-blue-300">
                              AWS S3
                            </span>
                            <span className="rounded-full bg-blue-900/40 px-3 py-1 text-sm text-blue-300">
                              DynamoDB
                            </span>
                            <span className="rounded-full bg-blue-900/40 px-3 py-1 text-sm text-blue-300">
                              IAM
                            </span>
                            <span className="rounded-full bg-blue-900/40 px-3 py-1 text-sm text-blue-300">
                              CI/CD (GitHub Actions)
                            </span>
                            <span className="rounded-full bg-blue-900/40 px-3 py-1 text-sm text-blue-300">
                              Terraform
                            </span>
                            <span className="rounded-full bg-blue-900/40 px-3 py-1 text-sm text-blue-300">
                              Docker
                            </span>
                          </div>
                        </div>

                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-4">
                          <h4 className="mb-3 text-lg font-bold text-green-400">
                            Monitoring & Observability
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-green-900/40 px-3 py-1 text-sm text-green-300">
                              Dynatrace
                            </span>
                            <span className="rounded-full bg-green-900/40 px-3 py-1 text-sm text-green-300">
                              FullStory
                            </span>
                            <span className="rounded-full bg-green-900/40 px-3 py-1 text-sm text-green-300">
                              AWS CloudWatch
                            </span>
                          </div>
                        </div>

                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-4">
                          <h4 className="mb-3 text-lg font-bold text-cyan-400">
                            Software Engineering
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-sm text-cyan-300">
                              Microservices
                            </span>
                            <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-sm text-cyan-300">
                              REST APIs
                            </span>
                            <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-sm text-cyan-300">
                              Event-Driven Architecture
                            </span>
                            <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-sm text-cyan-300">
                              Kafka
                            </span>
                            <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-sm text-cyan-300">
                              SNS/SQS
                            </span>
                            <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-sm text-cyan-300">
                              Agile
                            </span>
                            <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-sm text-cyan-300">
                              Test Automation (xUnit)
                            </span>
                            <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-sm text-cyan-300">
                              AutoMocker
                            </span>
                          </div>
                        </div>

                        <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-4">
                          <h4 className="mb-3 text-lg font-bold text-pink-400">
                            AI Tools
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-pink-900/40 px-3 py-1 text-sm text-pink-300">
                              CursorAI
                            </span>
                            <span className="rounded-full bg-pink-900/40 px-3 py-1 text-sm text-pink-300">
                              Claude
                            </span>
                            <span className="rounded-full bg-pink-900/40 px-3 py-1 text-sm text-pink-300">
                              OpenAI
                            </span>
                            <span className="rounded-full bg-pink-900/40 px-3 py-1 text-sm text-pink-300">
                              Supabase
                            </span>
                            <span className="rounded-full bg-pink-900/40 px-3 py-1 text-sm text-pink-300">
                              Pinecone
                            </span>
                            <span className="rounded-full bg-pink-900/40 px-3 py-1 text-sm text-pink-300">
                              Firebase
                            </span>
                            <span className="rounded-full bg-pink-900/40 px-3 py-1 text-sm text-pink-300">
                              LangChain
                            </span>
                            <span className="rounded-full bg-pink-900/40 px-3 py-1 text-sm text-pink-300">
                              Vercel
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 border-t border-cyan-800/30 pt-6">
                        <h4 className="mb-4 text-xl font-semibold text-cyan-400">
                          Core Attributes
                        </h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-4">
                            <h5 className="mb-2 font-bold text-cyan-300">
                              Automation Focus
                            </h5>
                            <p className="text-sm text-cyan-100">
                              Expert in creating AI-driven automation solutions
                              that streamline processes and save engineering
                              hours
                            </p>
                          </div>
                          <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-4">
                            <h5 className="mb-2 font-bold text-cyan-300">
                              Technical Problem Solving
                            </h5>
                            <p className="text-sm text-cyan-100">
                              Skilled at breaking down complex issues and
                              designing efficient, scalable solutions
                            </p>
                          </div>
                          <div className="rounded-lg border border-cyan-800/30 bg-cyan-900/10 p-4">
                            <h5 className="mb-2 font-bold text-cyan-300">
                              Continuous Learning
                            </h5>
                            <p className="text-sm text-cyan-100">
                              Committed to staying current with emerging
                              technologies and best practices in software
                              engineering
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-lg leading-relaxed text-cyan-100">
                    {panels.find((p) => p.id === activePanel)?.content}
                  </pre>
                )}
              </div>

              {/* Decorative corner elements */}
              <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-cyan-500" />
              <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-cyan-500" />
              <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-cyan-500" />
              <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-cyan-500" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add CSS for scan lines animation */}
      <style>{`
        @keyframes scanlines {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 100%;
          }
        }
        
        /* Add custom scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        .scrollbar-track-gray-900::-webkit-scrollbar-track {
          background: #111827;
        }
        
        .scrollbar-thumb-cyan-900::-webkit-scrollbar-thumb {
          background: #164e63;
          border-radius: 2px;
        }
      `}</style>

      {/* Enhanced Fullscreen JARVIS Interface */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="relative mx-4 flex h-[80vh] max-h-[700px] w-full max-w-4xl flex-col rounded-lg border border-cyan-500/50 bg-gray-900/95 shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-sm"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {/* Decorative corner elements */}
              <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-cyan-500" />
              <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-cyan-500" />
              <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-cyan-500" />
              <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-cyan-500" />

              {/* Tech scanlines effect */}
              <div
                className="pointer-events-none absolute inset-0 z-10 opacity-10"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(6, 182, 212, 0.1) 0px, rgba(6, 182, 212, 0.1) 1px, transparent 1px, transparent 6px)',
                  backgroundSize: '100% 6px',
                }}
              />

              {/* JARVIS header with advanced styling */}
              <div className="relative flex items-center justify-between border-b border-cyan-800/30 px-6 py-4">
                <div className="flex items-center">
                  <motion.div
                    className="relative mr-3 flex h-12 w-12 items-center justify-center rounded-full"
                    animate={{
                      boxShadow: [
                        '0 0 0 rgba(6, 182, 212, 0.4)',
                        '0 0 20px rgba(6, 182, 212, 0.8)',
                        '0 0 0 rgba(6, 182, 212, 0.4)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    <FaRobot className="text-2xl text-cyan-400" />
                  </motion.div>
                  <div>
                    <div className="text-xl font-bold tracking-wider text-cyan-400">
                      J.A.R.V.I.S.
                    </div>
                    <div className="flex items-center gap-2 text-xs text-cyan-600">
                      <span>JUST A RATHER VERY INTELLIGENT SYSTEM</span>
                      <div className="h-1 w-1 rounded-full bg-cyan-500" />
                      <span>v2.5.3</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="hidden items-center md:flex">
                    {audioVisualization.length > 0 && (
                      <div className="flex h-8 items-center space-x-0.5">
                        {audioVisualization.map((height, i) => (
                          <motion.div
                            key={i}
                            className="h-full w-0.5 bg-cyan-500"
                            style={{ height: `${height}%` }}
                            animate={{ height: `${Math.random() * 100}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <motion.button
                    className="rounded border border-cyan-800 bg-cyan-900/20 p-2 text-cyan-500 hover:bg-cyan-900/40 hover:text-cyan-300"
                    onClick={() => setChatOpen(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiX size={20} />
                  </motion.button>
                </div>
              </div>

              {/* JARVIS initialization overlay */}
              <AnimatePresence>
                {jarvisInitializing && (
                  <motion.div
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900/95"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="relative mb-8 h-32 w-32"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <div className="absolute inset-0 rounded-full border-2 border-cyan-800" />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500"
                        animate={{ rotate: -360 }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-transparent border-b-cyan-500 border-r-cyan-500"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span
                          className="text-4xl font-bold text-cyan-500"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          J
                        </motion.span>
                      </div>
                    </motion.div>

                    <div className="mb-4 text-center text-lg text-cyan-400">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        Initializing JARVIS Neural Interface
                      </motion.div>
                    </div>

                    <div className="mb-6 h-1 w-64 overflow-hidden rounded-full bg-gray-800">
                      <motion.div
                        className="h-full bg-cyan-500"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.8 }}
                      />
                    </div>

                    <div className="flex gap-2 text-xs text-cyan-600">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
                      <span>ESTABLISHING SECURE CONNECTION</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Two-column layout for chat interface */}
              <div className="flex flex-1 overflow-hidden">
                {/* Left column: Instructions and questions */}
                <div className="flex w-1/3 flex-col border-r border-cyan-900/30 bg-gray-900/80">
                  {/* Suggested Questions */}
                  <div className="scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-cyan-900 flex-1 overflow-y-auto p-4">
                    <div className="mb-3 flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-cyan-500" />
                      <h3 className="font-medium text-cyan-300">
                        Suggested Questions
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {suggestedQuestions.map((question, index) => (
                        <motion.button
                          key={index}
                          className={`w-full cursor-pointer rounded border px-3 py-2 text-left text-xs transition-all ${
                            askedQuestions.includes(question)
                              ? 'border-cyan-900/30 bg-gray-800/30 text-cyan-700'
                              : 'border-cyan-800/40 bg-cyan-900/10 text-cyan-300 hover:border-cyan-700 hover:bg-cyan-900/30'
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() =>
                            !askedQuestions.includes(question) &&
                            handleSuggestedQuestion(question)
                          }
                          disabled={askedQuestions.includes(question)}
                        >
                          <div className="flex items-center">
                            {!askedQuestions.includes(question) && (
                              <div className="mr-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                            )}
                            <div>{question}</div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Tech footer */}
                  <div className="border-t border-cyan-900/30 bg-cyan-900/20 p-3">
                    <div className="flex items-center justify-between text-xs text-cyan-600">
                      <div className="flex items-center">
                        <div className="mr-2 h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
                        <span>
                          TOKENS: {tokenUsage.promptTokens} IN /{' '}
                          {tokenUsage.completionTokens} OUT
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column: Actual chat */}
                <div className="flex w-2/3 flex-col bg-gray-900">
                  {/* Chat messages */}
                  <div className="scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-cyan-900 relative flex-1 overflow-y-auto p-4">
                    {/* Circular tech pattern background */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5">
                      <div className="h-[600px] w-[600px] rounded-full border-2 border-cyan-500" />
                      <div className="absolute h-[400px] w-[400px] rounded-full border border-cyan-500" />
                      <div className="absolute h-[200px] w-[200px] rounded-full border border-cyan-500" />
                    </div>

                    {chatMessages.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center text-center">
                        <motion.div
                          className="relative mb-6 h-24 w-24"
                          animate={{
                            boxShadow: [
                              '0 0 0 rgba(6, 182, 212, 0.4)',
                              '0 0 30px rgba(6, 182, 212, 0.8)',
                              '0 0 0 rgba(6, 182, 212, 0.4)',
                            ],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-cyan-500"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                          <FaRobot className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl text-cyan-400" />
                        </motion.div>

                        <motion.p
                          className="max-w-md text-lg text-cyan-300"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          JARVIS interface active
                        </motion.p>

                        <motion.p
                          className="mt-2 max-w-md text-sm text-cyan-600"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          Select a question from the left panel or type your own
                          below
                        </motion.p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatMessages.map((msg, index) => (
                          <motion.div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div
                              className={`max-w-[90%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                            >
                              {msg.role === 'assistant' && (
                                <div className="mb-1 flex items-center">
                                  <div className="mr-2 h-2 w-2 rounded-full bg-cyan-500" />
                                  <div className="text-xs font-medium text-cyan-500">
                                    JARVIS
                                  </div>
                                </div>
                              )}

                              <div
                                className={`relative rounded-lg px-4 py-3 ${
                                  msg.role === 'user'
                                    ? 'bg-cyan-800/40 text-white'
                                    : 'bg-gray-800/60 text-cyan-300'
                                }`}
                              >
                                {msg.role === 'assistant' && (
                                  <div className="absolute -left-1 top-0 h-2 w-2 rounded-full bg-cyan-500" />
                                )}

                                <div className="relative">
                                  {msg.content}

                                  {/* Slight glitch effect on text */}
                                  {msg.role === 'assistant' && (
                                    <div
                                      className="pointer-events-none absolute inset-0 opacity-10"
                                      style={{
                                        backgroundImage:
                                          'linear-gradient(0deg, transparent 0%, rgba(6, 182, 212, 0.3) 50%, transparent 100%)',
                                        backgroundSize: '100% 4px',
                                        animation:
                                          'scantext 3s linear infinite',
                                      }}
                                    />
                                  )}
                                </div>
                              </div>

                              {msg.role === 'user' && (
                                <div className="mt-1 flex items-center justify-end">
                                  <div className="text-xs font-medium text-cyan-600">
                                    YOU
                                  </div>
                                  <div className="ml-2 h-2 w-2 rounded-full bg-cyan-700" />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}

                        {/* JARVIS thinking indicator */}
                        {isJarvisThinking && (
                          <motion.div
                            className="flex justify-start"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="max-w-[80%] text-left">
                              <div className="mb-1 flex items-center">
                                <div className="mr-2 h-2 w-2 rounded-full bg-cyan-500" />
                                <div className="text-xs font-medium text-cyan-500">
                                  JARVIS
                                </div>
                              </div>

                              <div className="rounded-lg bg-gray-800/60 px-4 py-3 text-cyan-300">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">Processing</span>
                                  <div className="flex space-x-1">
                                    <motion.div
                                      className="h-2 w-2 rounded-full bg-cyan-500"
                                      animate={{ opacity: [0, 1, 0] }}
                                      transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        repeatDelay: 0,
                                      }}
                                    />
                                    <motion.div
                                      className="h-2 w-2 rounded-full bg-cyan-500"
                                      animate={{ opacity: [0, 1, 0] }}
                                      transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        repeatDelay: 0.2,
                                      }}
                                    />
                                    <motion.div
                                      className="h-2 w-2 rounded-full bg-cyan-500"
                                      animate={{ opacity: [0, 1, 0] }}
                                      transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        repeatDelay: 0.4,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <div ref={chatEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Chat input */}
                  <div className="border-t border-cyan-900/30 p-4">
                    <form onSubmit={handleSendMessage} className="relative">
                      <div className="flex items-center rounded-md border border-cyan-800/50 bg-gray-900/80 px-4 py-2">
                        <input
                          type="text"
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          placeholder="Ask JARVIS about Timal's experience..."
                          className="flex-1 bg-transparent py-1 text-sm text-cyan-100 outline-none"
                          disabled={jarvisInitializing || isJarvisThinking}
                        />

                        {currentMessage.trim() && (
                          <motion.button
                            type="submit"
                            className="ml-3 rounded-md bg-cyan-900/50 px-3 py-1 text-sm text-cyan-400"
                            whileHover={{
                              scale: 1.05,
                              backgroundColor: 'rgba(6, 182, 212, 0.3)',
                            }}
                            whileTap={{ scale: 0.95 }}
                            disabled={jarvisInitializing || isJarvisThinking}
                          >
                            <span className="flex items-center gap-2">
                              <span>Send</span>
                              <FiSend />
                            </span>
                          </motion.button>
                        )}
                      </div>

                      {/* Tech info bar */}
                      <div className="mt-2 flex justify-end text-xs text-cyan-600">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center">
                            <span>
                              {isOpenAIConnected
                                ? 'OpenAI link active...'
                                : 'OpenAI link degraded'}
                            </span>
                            <div
                              className={`ml-2 h-1.5 w-1.5 rounded-full ${isOpenAIConnected ? 'bg-green-500' : 'bg-red-500'}`}
                            />
                          </div>
                          <div className="mt-1 flex items-center">
                            <span>
                              {isRagAvailable
                                ? 'Accessing context via RAG...'
                                : 'Context access unavailable'}
                            </span>
                            <div
                              className={`ml-2 h-1.5 w-1.5 rounded-full ${isRagAvailable ? 'bg-green-500' : 'bg-red-500'}`}
                            />
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add scan text animation */}
      <style>{`
        @keyframes scantext {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 100%;
          }
        }
      `}</style>

      {/* Add the welcome screen modal */}
      <AnimatePresence>
        {showChatWelcome && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="relative mx-4 flex h-auto max-w-2xl flex-col rounded-lg border border-cyan-500/50 bg-gray-900/95 px-8 py-12 shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-sm"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {/* Decorative corner elements */}
              <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-cyan-500" />
              <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-cyan-500" />
              <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-cyan-500" />
              <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-cyan-500" />

              {/* Header with icon */}
              <div className="mb-6 flex items-center">
                <motion.div
                  className="relative mr-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-cyan-500"
                  animate={{
                    boxShadow: [
                      '0 0 0 rgba(6, 182, 212, 0.4)',
                      '0 0 30px rgba(6, 182, 212, 0.6)',
                      '0 0 0 rgba(6, 182, 212, 0.4)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <FaRobot className="text-3xl text-cyan-400" />
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-cyan-400">
                    Welcome...
                  </h2>
                </div>
              </div>

              {/* Welcome content */}
              <div className="mb-6 space-y-4">
                <p className="text-cyan-100">
                  JARVIS is a custom-built AI assistant designed by Timal to
                  help you explore his full story, professionally and
                  personally. Using advanced retrieval (RAG) technology.
                </p>

                <div className="rounded-md border border-cyan-800/30 bg-cyan-900/20 p-4">
                  <h3 className="mb-3 font-semibold text-cyan-300">
                    Powered by RAG, JARVIS can retrieve information about:
                  </h3>
                  <ul className="space-y-2 text-sm text-cyan-100">
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                      <span>
                        Career milestones, roles, and impact in engineering
                        teams
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                      <span>Certifications and skills</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                      <span>
                        Personal projects, passions, and side projects like
                        JARVIS and Monark
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                      <span>
                        Life outside of work: interests, values, and personal
                        philosophy
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Continue button */}
              <div className="flex justify-center">
                <motion.button
                  onClick={handleContinueToChat}
                  className="rounded-md border border-cyan-500 bg-cyan-500/10 px-8 py-3 font-medium text-cyan-400 hover:bg-cyan-500/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue to Chat
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default JarvisUI
