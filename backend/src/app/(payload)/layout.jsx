import '@payloadcms/next/css'
import './custom.scss'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import config from '../../../payload.config.js'
import { importMap } from './admin/importMap.js'

const serverFunction = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

export default function Layout({ children }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}