"use client"

import { useState, KeyboardEvent } from "react"
import clsx from "clsx"

interface TagInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
  predefinedTags?: string[]
  className?: string
}

const TagInput = ({
  tags,
  onTagsChange,
  placeholder = "Add an item and press Enter",
  predefinedTags = [],
  className = "",
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredSuggestions = predefinedTags.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(tag)
  )

  // Add "Add <xyz>..." option if input doesn't match any existing suggestions
  const hasExactMatch = predefinedTags.some(tag => 
    tag.toLowerCase() === inputValue.toLowerCase()
  )
  const shouldShowAddOption = inputValue.trim().length > 0 && 
                             !hasExactMatch && 
                             !tags.includes(inputValue.trim())

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag])
    }
    setInputValue("")
    setShowSuggestions(false)
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      
      // If there are filtered suggestions, select the first one
      if (filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[0])
      } else {
        // Otherwise, add the typed text as a new item
        addTag(inputValue)
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion)
  }

  return (
    <div className={clsx("relative", className)}>
      <div 
        className="min-h-[44px] p-2 border border-text-dm rounded-md focus-within:ring-1 focus-within:ring-pink-dark focus-within:border-pink-dark cursor-text"
        onClick={() => {
          const input = document.querySelector(`input[type="text"]`) as HTMLInputElement
          if (input) {
            input.focus()
          }
        }}
      >
        <div className="flex flex-wrap gap-1 mb-1">
          {tags.map((tag, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-pink-light text-pink-dark rounded-md hover:bg-pink-medium focus:outline-none focus:ring-2 focus:ring-pink-dark focus:ring-offset-1 transition-colors cursor-pointer"
            >
              {tag}
              <span className="ml-1 text-pink-dark">
                ×
              </span>
            </button>
          ))}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowSuggestions(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="w-full font-mono text-sm bg-transparent border-none outline-none"
        />
      </div>

      {showSuggestions && (filteredSuggestions.length > 0 || shouldShowAddOption) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-3 py-2 text-left text-sm font-mono hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                index === 0 ? 'bg-gray-50' : ''
              }`}
            >
              {suggestion}
            </button>
          ))}
          {shouldShowAddOption && (
            <button
              type="button"
              onClick={() => handleSuggestionClick(inputValue.trim())}
              className={`w-full px-3 py-2 text-left text-sm font-mono hover:bg-gray-100 focus:outline-none focus:bg-gray-100 text-gray-600 italic ${
                filteredSuggestions.length === 0 ? 'bg-gray-50' : ''
              }`}
            >
              Add "{inputValue.trim()}"...
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default TagInput
