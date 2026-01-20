import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Upload, FileText, Calendar, Filter, X } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Documents } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Documents[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Documents[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [skip, setSkip] = useState(0);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    documentName: '',
    documentType: '',
    documentFile: ''
  });

  const loadDocuments = async (skipValue = 0) => {
    try {
      const result = await BaseCrudService.getAll<Documents>('documents', {}, { limit: 50, skip: skipValue });
      if (skipValue === 0) {
        setDocuments(result.items);
        setFilteredDocuments(result.items);
      } else {
        setDocuments(prev => [...prev, ...result.items]);
        setFilteredDocuments(prev => [...prev, ...result.items]);
      }
      setHasNext(result.hasNext);
      setSkip(result.nextSkip || 0);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    let filtered = documents;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.documentName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.documentType === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(doc => doc.processingStatus === filterStatus);
    }

    setFilteredDocuments(filtered);
  }, [searchQuery, filterType, filterStatus, documents]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newDocument: Documents = {
      _id: crypto.randomUUID(),
      documentName: uploadForm.documentName,
      documentType: uploadForm.documentType,
      documentFile: uploadForm.documentFile,
      uploadDate: new Date().toISOString(),
      processingStatus: 'processing'
    };

    // Optimistic update
    setDocuments(prev => [newDocument, ...prev]);
    setFilteredDocuments(prev => [newDocument, ...prev]);
    setIsUploadOpen(false);
    setUploadForm({ documentName: '', documentType: '', documentFile: '' });

    try {
      await BaseCrudService.create('documents', newDocument);
    } catch (error) {
      console.error('Error uploading document:', error);
      loadDocuments();
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    setDocuments(prev => prev.filter(doc => doc._id !== id));
    setFilteredDocuments(prev => prev.filter(doc => doc._id !== id));

    try {
      await BaseCrudService.delete('documents', id);
    } catch (error) {
      console.error('Error deleting document:', error);
      loadDocuments();
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-primary';
      case 'failed':
        return 'text-destructive';
      default:
        return 'text-textprimary';
    }
  };

  const uniqueTypes = Array.from(new Set(documents.map(doc => doc.documentType).filter(Boolean)));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="w-full">
        {/* Page Header */}
        <section className="w-full bg-secondary py-16">
          <div className="max-w-[100rem] mx-auto px-8 md:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-heading text-5xl md:text-6xl text-secondary-foreground mb-4">
                Document Library
              </h1>
              <p className="font-paragraph text-lg text-secondary-foreground">
                Manage and process your documents with intelligent OCR technology
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="w-full bg-background py-8 border-b border-gray-200">
          <div className="max-w-[100rem] mx-auto px-8 md:px-16">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 font-paragraph"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px] font-paragraph">
                    <SelectValue placeholder="Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type!}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px] font-paragraph">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Upload Button */}
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground hover:opacity-90 font-paragraph">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="font-heading text-2xl">Upload New Document</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-6 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="documentName" className="font-paragraph">Document Name</Label>
                        <Input
                          id="documentName"
                          value={uploadForm.documentName}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, documentName: e.target.value }))}
                          placeholder="Enter document name"
                          required
                          className="font-paragraph"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="documentType" className="font-paragraph">Document Type</Label>
                        <Select 
                          value={uploadForm.documentType} 
                          onValueChange={(value) => setUploadForm(prev => ({ ...prev, documentType: value }))}
                        >
                          <SelectTrigger className="font-paragraph">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PDF">PDF</SelectItem>
                            <SelectItem value="Image">Image</SelectItem>
                            <SelectItem value="Scan">Scan</SelectItem>
                            <SelectItem value="Invoice">Invoice</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="documentFile" className="font-paragraph">File URL</Label>
                        <Input
                          id="documentFile"
                          value={uploadForm.documentFile}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, documentFile: e.target.value }))}
                          placeholder="Enter file URL"
                          required
                          className="font-paragraph"
                        />
                      </div>
                      <div className="flex gap-3 justify-end">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsUploadOpen(false)}
                          className="font-paragraph"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          className="bg-primary text-primary-foreground hover:opacity-90 font-paragraph"
                        >
                          Upload
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Active Filters */}
            {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
              <div className="flex flex-wrap gap-2 mt-4">
                {searchQuery && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-textprimary font-paragraph text-sm">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery('')}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {filterType !== 'all' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-textprimary font-paragraph text-sm">
                    Type: {filterType}
                    <button onClick={() => setFilterType('all')}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {filterStatus !== 'all' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-textprimary font-paragraph text-sm">
                    Status: {filterStatus}
                    <button onClick={() => setFilterStatus('all')}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Documents Grid */}
        <section className="w-full bg-background py-12" style={{ minHeight: '60vh' }}>
          <div className="max-w-[100rem] mx-auto px-8 md:px-16">
            {isLoading ? null : filteredDocuments.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDocuments.map((doc, index) => (
                    <motion.div
                      key={doc._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Link 
                        to={`/documents/${doc._id}`}
                        className="block border border-gray-200 p-6 hover:border-primary transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <FileText className="w-10 h-10 text-primary" strokeWidth={1.5} />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDelete(doc._id);
                            }}
                            className="text-gray-400 hover:text-destructive transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <h3 className="font-heading text-xl text-textprimary mb-2 group-hover:text-primary transition-colors">
                          {doc.documentName}
                        </h3>
                        <div className="space-y-2">
                          <p className="font-paragraph text-sm text-gray-600">
                            Type: {doc.documentType || 'Unknown'}
                          </p>
                          <p className={`font-paragraph text-sm ${getStatusColor(doc.processingStatus)}`}>
                            Status: {doc.processingStatus || 'Unknown'}
                          </p>
                          {doc.uploadDate && (
                            <p className="font-paragraph text-sm text-gray-600 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(doc.uploadDate), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Load More */}
                {hasNext && (
                  <div className="mt-12 text-center">
                    <Button
                      onClick={() => loadDocuments(skip)}
                      className="bg-primary text-primary-foreground hover:opacity-90 font-paragraph"
                    >
                      Load More Documents
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-heading text-2xl text-textprimary mb-2">
                  No Documents Found
                </h3>
                <p className="font-paragraph text-base text-gray-600 mb-6">
                  {searchQuery || filterType !== 'all' || filterStatus !== 'all' 
                    ? 'Try adjusting your filters or search query'
                    : 'Upload your first document to get started'}
                </p>
                <Button
                  onClick={() => setIsUploadOpen(true)}
                  className="bg-primary text-primary-foreground hover:opacity-90 font-paragraph"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
