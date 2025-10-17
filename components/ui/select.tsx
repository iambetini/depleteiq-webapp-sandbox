"use client"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { storeApis } from "@/store"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import * as React from "react"
import { useEffect, useState } from "react"

interface SelectWithFetchProps<T = any> {
  fetchUrl?: string
  store?: keyof typeof storeApis
  value: string
  onChange: (value: string) => void
  valueKey?: string
  labelKey?: string
  searchParam?: string
  initialSearch?: string
  placeholder?: string
  disabled?: boolean
  labelFormatter?: (item: T) => string
  className?: string
  params?: Record<string, any>
}


const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-80 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
        "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
          "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined
  }, obj)
}

function SelectWithFetch<T = any>({
  fetchUrl,
  store,
  value,
  onChange,
  valueKey = "uuid",
  labelKey = "name",
  searchParam = "search",
  initialSearch = "",
  placeholder = "Select...",
  disabled = false,
  labelFormatter,
  className,
  params = {},
}: SelectWithFetchProps<T>) {
  const [options, setOptions] = useState<T[]>([])
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [loading, setLoading] = useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [cursorPosition, setCursorPosition] = React.useState(0)
  const [isTyping, setIsTyping] = React.useState(false)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handler)
  }, [search])

  // Build query parameters with search - memoize params object to prevent unnecessary re-renders
  const queryParams = React.useMemo(() => {
    const baseParams = { ...params }
    if (debouncedSearch.trim()) {
      baseParams[searchParam] = debouncedSearch
    }
    return baseParams
  }, [params, debouncedSearch, searchParam])

  // Store-based query (recommended approach)
  const storeQuery = store ? storeApis[store]?.useGetAllQuery(queryParams) : undefined

  useEffect(() => {
    if (!fetchUrl || store) return

    setLoading(true)

    // Dynamic import to avoid bundling apiClient when not needed
    import("@/lib/api-client").then(({ apiClient }) => {
      const url = new URL(fetchUrl, window.location.origin)

      // Set default per_page to 1000 if not already specified
      if (!url.searchParams.has('per_page')) {
        url.searchParams.set('per_page', '1000')
      }

      if (debouncedSearch.trim()) {
        url.searchParams.set(searchParam, debouncedSearch)
      }

      const finalUrl = url.pathname + url.search

      apiClient
        .get<{ items: T[] }>(finalUrl)
        .then(({ data }) => {
          const items = data.items || data || []
          const processedItems = Array.isArray(items) ? items : []
          setOptions(processedItems)
        })
        .catch((error) => { setOptions([]) })
        .finally(() => setLoading(false))
    })
  }, [fetchUrl, debouncedSearch, searchParam, store])

  // Determine final options and loading state
  const finalOptions = React.useMemo(() => {
    if (store && storeQuery?.data) {
      const resp = storeQuery.data as any
      if (Array.isArray(resp)) {
        return resp as T[]
      }
      const items = resp?.data?.items ?? resp?.items ?? []
      return items as T[]
    }
    return options
  }, [store, storeQuery?.data, options])

  const isLoading = store ? (storeQuery?.isLoading ?? false) : loading

  // Memoize search handler to prevent unnecessary re-renders
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTyping(true)
    setSearch(e.target.value)
    setCursorPosition(e.target.selectionStart || 0)
    // Clear typing state after a brief delay
    setTimeout(() => setIsTyping(false), 100)
  }, [])

  const handleSearchFocus = React.useCallback(() => {
    setIsTyping(true)
  }, [])

  const handleSearchBlur = React.useCallback(() => {
    // Clear typing state after blur with delay
    setTimeout(() => setIsTyping(false), 150)
  }, [])

  const handleKeyUp = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Capture cursor position on key events
    setCursorPosition((e.target as HTMLInputElement).selectionStart || 0)
  }, [])

  // Restore focus and cursor position after re-renders
  React.useEffect(() => {
    if (isTyping && inputRef.current && document.activeElement !== inputRef.current) {
      const restoreFocus = () => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.setSelectionRange(cursorPosition, cursorPosition)
        }
      }
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(restoreFocus)
    }
  }, [isTyping, cursorPosition])

  // Additional effect to restore focus when options change during typing
  React.useEffect(() => {
    if (isTyping && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus()
          inputRef.current.setSelectionRange(cursorPosition, cursorPosition)
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [debouncedSearch, isTyping, cursorPosition])

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <Input
            ref={inputRef}
            placeholder="Search..."
            value={search}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onKeyUp={handleKeyUp}
            autoFocus
          />
        </div>
        {isLoading && <div className="px-3 py-2 text-gray-400">Searching...</div>}
        {finalOptions.length === 0 && !isLoading && (
          <div className="px-3 py-2 text-gray-400">No options found</div>
        )}
        <div className="max-h-60 overflow-y-auto">
          {finalOptions.map((item: any) => {
            const itemValue = getNestedValue(item, valueKey)
            const displayLabel = labelFormatter
              ? labelFormatter(item)
              : getNestedValue(item, labelKey)

            return (
              <SelectItem key={itemValue} value={itemValue}>
                {displayLabel}
              </SelectItem>
            )
          })}
        </div>
      </SelectContent>
    </Select>
  )
}

function CommandWithFetch<T = any>({
  fetchUrl,
  store,
  value,
  onChange,
  valueKey = "uuid",
  labelKey = "name",
  searchParam = "search",
  initialSearch = "",
  placeholder = "Select...",
  disabled = false,
  labelFormatter,
  className,
  params = {},
}: SelectWithFetchProps<T>) {
  const [options, setOptions] = useState<T[]>([])
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted before rendering
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handler)
  }, [search])

  // Build query parameters with search - memoize params object to prevent unnecessary re-renders
  const queryParams = React.useMemo(() => {
    const baseParams = { ...params }
    if (debouncedSearch.trim()) {
      baseParams[searchParam] = debouncedSearch
    }
    return baseParams
  }, [params, debouncedSearch, searchParam])

  // Store-based query (recommended approach)
  const storeQuery = store ? storeApis[store]?.useGetAllQuery(queryParams) : undefined

  useEffect(() => {
    if (!fetchUrl || store) return

    setLoading(true)

    // Dynamic import to avoid bundling apiClient when not needed
    import("@/lib/api-client").then(({ apiClient }) => {
      const url = new URL(fetchUrl, window.location.origin)

      // Set default per_page to 1000 if not already specified
      if (!url.searchParams.has('per_page')) {
        url.searchParams.set('per_page', '1000')
      }

      if (debouncedSearch.trim()) {
        url.searchParams.set(searchParam, debouncedSearch)
      }

      const finalUrl = url.pathname + url.search

      apiClient
        .get<{ items: T[] }>(finalUrl)
        .then(({ data }) => {
          const items = data.items || data || []
          const processedItems = Array.isArray(items) ? items : []
          setOptions(processedItems)
        })
        .catch((error) => { setOptions([]) })
        .finally(() => setLoading(false))
    })
  }, [fetchUrl, debouncedSearch, searchParam, store])

  // Determine final options and loading state
  const finalOptions = React.useMemo(() => {
    if (store && storeQuery?.data) {
      const resp = storeQuery.data as any
      if (Array.isArray(resp)) {
        return resp as T[]
      }
      const items = resp?.data?.items ?? resp?.items ?? []
      return items as T[]
    }
    return options
  }, [store, storeQuery?.data, options])

  const isLoading = store ? (storeQuery?.isLoading ?? false) : loading

  // Find selected item for display
  const selectedItem = finalOptions.find((item: any) => getNestedValue(item, valueKey) === value)
  const displayValue = selectedItem
    ? (labelFormatter ? labelFormatter(selectedItem) : getNestedValue(selectedItem, labelKey))
    : placeholder

  // Don't render until mounted to prevent SSR/client mismatch issues
  if (!isMounted) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={false}
        className={cn("w-full justify-between", className)}
        disabled={disabled}
      >
        {placeholder}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {displayValue}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            value={search}
            onValueChange={setSearch}
            className="h-9"
          />
          <CommandEmpty>No options found.</CommandEmpty>
          {isLoading && <div className="px-3 py-2 text-gray-400">Searching...</div>}
          <CommandGroup className="max-h-60 overflow-y-auto">
            {finalOptions.map((item: any) => {
              const itemValue = getNestedValue(item, valueKey)
              const displayLabel = labelFormatter
                ? labelFormatter(item)
                : getNestedValue(item, labelKey)

              return (
                <CommandItem
                  key={itemValue}
                  value={displayLabel}
                  onSelect={() => {
                    onChange(itemValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === itemValue ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {displayLabel}
                </CommandItem>
              )
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { CommandWithFetch, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue, SelectWithFetch }
