import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { storageService } from '../services/storageService'
import { postService } from '../services/postService'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import RightSidebar from '../components/layout/RightSidebar'
import MobileNav from '../components/layout/MobileNav'

export default function CreatePost() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [destination, setDestination] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle Photo Selection & Local Validation
  function handleFileChange(e) {
    setError('')
    const file = e.target.files[0]
    if (!file) return

    // Validate type (JPG, JPEG, PNG, WEBP)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, JPEG, PNG, or WEBP).')
      return
    }

    // Validate size (10 MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError('Selected photo exceeds the maximum size limit of 10 MB.')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveImage() {
    setSelectedFile(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle Form Submission
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Basic Validation
    if (!selectedFile) {
      setError('Please select a travel photograph to share.')
      return
    }
    if (!title.trim()) {
      setError('Please enter a title for your journey.')
      return
    }
    if (!destination.trim()) {
      setError('Please enter the destination location.')
      return
    }
    if (!user) {
      setError('Authentication session lost. Please log in again.')
      return
    }

    setLoading(true)
    try {
      // 1. Upload photograph to Supabase Storage
      const imageUrl = await storageService.uploadPhoto(selectedFile, user.id)

      // 2. Parse tags into a clean array
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .map((t) => (t.startsWith('#') ? t : `#${t}`))

      // 3. Store record in Supabase Database
      await postService.createPost({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl,
        destination: destination.trim(),
        tags
      })

      // Redirect home on success
      navigate('/home')
    } catch (err) {
      console.error('Failed to publish travel post:', err)
      setError('Unable to publish your post. Please check database permissions and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-16 lg:pb-0">
      <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex max-w-7xl w-full mx-auto flex-1">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-display font-bold mb-1.5">Create a Travel Post</h1>
            <p className="text-slate-400 text-sm">Share a moment from your journey with the TripNest community.</p>
          </div>

          {error && <div className="error-box mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
            
            {/* Left Column: Photo Uploader & Preview */}
            <div className="flex flex-col gap-4">
              <label className="form-label">Travel Photograph</label>
              
              {!imagePreview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 min-h-[300px] border-2 border-dashed border-slate-800 hover:border-brand-500 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer bg-slate-900/20 hover:bg-slate-900/40 transition duration-200 group"
                >
                  <svg className="w-12 h-12 text-slate-500 group-hover:text-brand-400 mb-3 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-semibold text-slate-300">Click to upload photo</p>
                  <p className="text-xs text-slate-500 mt-1">Supports JPG, JPEG, PNG, WEBP (Max 10 MB)</p>
                </div>
              ) : (
                <div className="relative aspect-square md:aspect-auto md:flex-1 min-h-[300px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-850">
                  <img src={imagePreview} alt="Selected travel photograph preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-4 right-4 bg-slate-950/80 hover:bg-slate-900 backdrop-blur text-white p-2 rounded-xl border border-slate-800 transition duration-200"
                    title="Remove image"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
            </div>

            {/* Right Column: Text Details Form Fields */}
            <div className="glass-card p-6 bg-slate-900/40 border-slate-800/80 flex flex-col gap-4">
              <div>
                <label htmlFor="post-title" className="form-label">Journey Title</label>
                <input
                  id="post-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your journey a title"
                  className="glass-input bg-slate-950/40 border-slate-850"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="post-destination" className="form-label">Destination</label>
                <input
                  id="post-destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where was this photo taken? (e.g. Goa, India)"
                  className="glass-input bg-slate-950/40 border-slate-850"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="post-tags" className="form-label">Tags (comma-separated)</label>
                <input
                  id="post-tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Kerala, Beach, Sunset, Explorer"
                  className="glass-input bg-slate-950/40 border-slate-850"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="post-description" className="form-label">Tell the community about this moment</label>
                <textarea
                  id="post-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a caption describing your trip details, tips, or experiences..."
                  className="glass-input bg-slate-950/40 border-slate-850 resize-none"
                  disabled={loading}
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn-primary mt-auto"
                disabled={loading}
              >
                {loading ? 'Publishing...' : 'Publish Journey'}
              </button>
            </div>

          </form>
        </main>

        <RightSidebar />
      </div>

      <MobileNav />
    </div>
  )
}
