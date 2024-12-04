import React, { useEffect, useRef } from 'react'
import {
  CContainer,
  CHeader,
} from '@coreui/react'



import { AppBreadcrumb } from './index'

const AppHeader = () => {
  const headerRef = useRef()

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
