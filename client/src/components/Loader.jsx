const Loader = () => {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center gap-4 bg-white'>
      <div className='flex gap-1'>
        <div className='w-2 h-8 bg-black animate-pulse rounded-full' style={{ animationDelay: '0ms' }} />
        <div className='w-2 h-8 bg-black animate-pulse rounded-full' style={{ animationDelay: '150ms' }} />
        <div className='w-2 h-8 bg-black animate-pulse rounded-full' style={{ animationDelay: '300ms' }} />
      </div>
      <p className='text-xs tracking-[6px] uppercase text-gray-400'>Syed & Sons</p>
    </div>
  )
}

export default Loader