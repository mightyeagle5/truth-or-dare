import React from 'react'

/**
 * Highlights matching text in a string based on a search query
 * Returns JSX with highlighted spans
 */
export const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) {
    return text
  }

  // Split query into words for better matching
  const searchWords = query.trim().toLowerCase().split(/\s+/)
  
  // Create a regex pattern that matches any of the search words
  const pattern = searchWords.map(word => 
    word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
  ).join('|')
  
  const regex = new RegExp(`(${pattern})`, 'gi')
  
  const parts = text.split(regex)
  
  return React.createElement(
    React.Fragment,
    null,
    parts.map((part, index) => {
      const isMatch = searchWords.some(word => 
        part.toLowerCase().includes(word) || word.includes(part.toLowerCase())
      )
      
      return isMatch
        ? React.createElement(
            'strong',
            { key: index },
            part
          )
        : React.createElement('span', { key: index }, part)
    })
  )
}

