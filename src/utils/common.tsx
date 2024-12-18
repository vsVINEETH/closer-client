// components/providers/AuthProvider.tsx
// 'use client'
// import { useEffect } from 'react'
// import { useRouter, usePathname } from 'next/navigation'
// import { useSelector } from 'react-redux'
// import { RootState } from '@/store'

// // Define protected routes and their allowed roles
// const ROUTE_PERMISSIONS = {
//   '/dashboard': ['user', 'admin', 'employee'],
//   '/admin': ['admin'],
//   '/employee': ['employee'],
//   '/profile': ['user', 'admin', 'employee'],
// } as const

// const PUBLIC_ROUTES = ['/login', '/register', '/', '/unauthorized'] as const

// type ProtectedRoutes = keyof typeof ROUTE_PERMISSIONS
// type PublicRoutes = typeof PUBLIC_ROUTES[number]

// interface AuthProviderProps {
//   children: React.ReactNode
// }

// export function AuthProvider({ children }: AuthProviderProps) {
//   const router = useRouter()
//   const pathname = usePathname()
  
//   // Get authentication states from all slices
//   const { isAuthenticated: isUser, user } = useSelector((state: RootState) => state.user)
//   const { isAuthenticated: isAdmin } = useSelector((state: RootState) => state.admin)
//   const { isAuthenticated: isEmployee } = useSelector((state: RootState) => state.employee)

//   // Determine current role and authentication status
//   const isAuthenticated = isUser || isAdmin || isEmployee
//   const currentRole = isAdmin ? 'admin' : isEmployee ? 'employee' : isUser ? 'user' : null

//   useEffect(() => {
//     // Allow access to public routes
//     if (PUBLIC_ROUTES.includes(pathname as PublicRoutes)) {
//       // Redirect authenticated users away from login/register
//       if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
//         router.replace('/dashboard')
//       }
//       return
//     }

//     // Check if route requires authentication
//     const requiredRoles = ROUTE_PERMISSIONS[pathname as ProtectedRoutes]
    
//     if (!requiredRoles) {
//       return // Not a protected route
//     }

//     if (!isAuthenticated) {
//       // Save attempted URL and redirect to login
//       sessionStorage.setItem('redirectUrl', pathname)
//       router.replace('/login')
//       return
//     }

//     // Check role-based access
//     if (currentRole && !requiredRoles.includes(currentRole)) {
//       router.replace('/unauthorized')
//       return
//     }
//   }, [pathname, isAuthenticated, currentRole, router])

//   return <>{children}</>
// }

// // Custom hook for checking authentication in components
// export function useAuthStatus() {
//   const { isAuthenticated: isUser, user } = useSelector((state: RootState) => state.user)
//   const { isAuthenticated: isAdmin } = useSelector((state: RootState) => state.admin)
//   const { isAuthenticated: isEmployee } = useSelector((state: RootState) => state.employee)

//   return {
//     isAuthenticated: isUser || isAdmin || isEmployee,
//     role: isAdmin ? 'admin' : isEmployee ? 'employee' : isUser ? 'user' : null,
//     user
//   }
// }


// components/hoc/withAuth.tsx
// 'use client'
// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAuthStatus } from '../providers/AuthProvider'

// interface WithAuthProps {
//   allowedRoles?: ('user' | 'admin' | 'employee')[]
// }

// export function withAuth<P extends object>(
//   WrappedComponent: React.ComponentType<P>,
//   { allowedRoles }: WithAuthProps = {}
// ) {
//   return function ProtectedComponent(props: P) {
//     const router = useRouter()
//     const { isAuthenticated, role } = useAuthStatus()

//     useEffect(() => {
//       if (!isAuthenticated) {
//         router.replace('/login')
//         return
//       }

//       if (allowedRoles && role && !allowedRoles.includes(role)) {
//         router.replace('/unauthorized')
//       }
//     }, [isAuthenticated, role, router])

//     if (!isAuthenticated) {
//       return null
//     }

//     if (allowedRoles && role && !allowedRoles.includes(role)) {
//       return null
//     }

//     return <WrappedComponent {...props} />
//   }
// }



// //Here's how to use this setup in your application:

// //First, wrap your app with the AuthProvider:

// // app/layout.tsx
// 'use client'
// import { Provider } from 'react-redux'
// import { PersistGate } from 'redux-persist/integration/react'
// import { store, persistor } from '@/store'
// import { AuthProvider } from '@/components/providers/AuthProvider'

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body>
//         <Provider store={store}>
//           <PersistGate loading={null} persistor={persistor}>
//             <AuthProvider>
//               {children}
//             </AuthProvider>
//           </PersistGate>
//         </Provider>
//       </body>
//     </html>
//   )
// }

// //Create protected pages/components:

// // app/dashboard/page.tsx
// 'use client'
// import { withAuth } from '@/components/hoc/withAuth'

// function DashboardPage() {
//   return (
//     <div>
//       <h1>Dashboard</h1>
//       {/* Dashboard content */}
//     </div>
//   )
// }

// // Protected for all authenticated users
// export default withAuth(DashboardPage)

// // app/admin/page.tsx
// 'use client'
// import { withAuth } from '@/components/hoc/withAuth'

// function AdminPage() {
//   return (
//     <div>
//       <h1>Admin Dashboard</h1>
//       {/* Admin content */}
//     </div>
//   )
// }

// // Protected for admin role only
// export default withAuth(AdminPage, { allowedRoles: ['admin'] })

// // Create login component with redirect:

// 'use client'
// import { useState } from 'react'
// import { useDispatch } from 'react-redux'
// import { useRouter } from 'next/navigation'
// import { loginSuccess } from '@/store/slices/userSlice'

// export default function LoginPage() {
//   const dispatch = useDispatch()
//   const router = useRouter()
  
//   const handleLogin = async (credentials: LoginCredentials) => {
//     try {
//       const response = await loginUser(credentials)
//       dispatch(loginSuccess(response.user))
      
//       // Redirect to saved URL or dashboard
//       const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard'
//       sessionStorage.removeItem('redirectUrl')
//       router.replace(redirectUrl)
//     } catch (error) {
//       // Handle error
//     }
//   }

//   return (
//     // Your login form JSX
//   )
// }


// // Create an unauthorized page:
// // app/unauthorized/page.tsx
// 'use client'
// import { useRouter } from 'next/navigation'

// export default function UnauthorizedPage() {
//   const router = useRouter()

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen">
//       <h1 className="text-2xl font-bold">Access Denied</h1>
//       <p className="mt-4">You don't have permission to access this page.</p>
//       <button 
//         onClick={() => router.back()}
//         className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//       >
//         Go Back
//       </button>
//     </div>
//   )
// }
// // This implementation provides:

// // Centralized Auth Logic: The AuthProvider handles all route protection logic
// // Role-Based Access: Different routes for different user types
// // Flexible HOC: For protecting specific components with role-based access
// // Redirect Handling: Saves attempted URL and redirects after login
// // Type Safety: TypeScript support for routes and roles

// // Key features:

// // Uses only client components
// // Fully integrated with Redux store
// // Handles all authentication states (user, admin, employee)
// // Preserves attempted URL for post-login redirect
// // Type-safe route and role definitions

// // To add new protected routes:

// // Add the route and allowed roles to ROUTE_PERMISSIONS in AuthProvider
// // Create the page component
// // Wrap it with the withAuth HOC with appropriate roles