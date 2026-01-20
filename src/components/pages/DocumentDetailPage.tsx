import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Calendar, Clock, Download, Trash2, Edit } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Documents } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Documents | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    documentName: '',
    documentType: '',
    processingStatus: '',
    extractedText: ''
  });

  const loadDocument = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const data = await BaseCrudService.getById<Documents>('documents', id);
      setDocument(data);
      if (data) {
        setEditForm({
          documentName: data.documentName || '',
          documentType: data.documentType || '',
          processingStatus: data.processingStatus || '',
          extractedText: data.extractedText || ''
        });
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this document?')) return;

    try {
      await BaseCrudService.delete('documents', id);
      navigate('/documents');
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const updatedDocument = {
      _id: id,
      documentName: editForm.documentName,
      documentType: editForm.documentType,
      processingStatus: editForm.processingStatus,
      extractedText: editForm.extractedText
    };

    // Optimistic update
    setDocument(prev => prev ? { ...prev, ...updatedDocument } : null);
    setIsEditOpen(false);

    try {
      await BaseCrudService.update('documents', updatedDocument);
    } catch (error) {
      console.error('Error updating document:', error);
      loadDocument();
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'processing':
        return 'text-primary bg-orange-50 border-primary';
      case 'failed':
        return 'text-destructive bg-red-50 border-destructive';
      default:
        return 'text-textprimary bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="w-full">
        {/* Back Navigation */}
        <section className="w-full bg-background py-6 border-b border-gray-200">
          <div className="max-w-[100rem] mx-auto px-8 md:px-16">
            <Link 
              to="/documents"
              className="inline-flex items-center gap-2 font-paragraph text-base text-textprimary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Documents
            </Link>
          </div>
        </section>

        {/* Document Details */}
        <section className="w-full bg-background py-12" style={{ minHeight: '60vh' }}>
          <div className="max-w-[100rem] mx-auto px-8 md:px-16">
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <LoadingSpinner />
              </div>
            ) : !document ? (
              <div className="text-center py-24">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="font-heading text-3xl text-textprimary mb-2">
                  Document Not Found
                </h2>
                <p className="font-paragraph text-base text-gray-600 mb-6">
                  The document you're looking for doesn't exist or has been deleted
                </p>
                <Link to="/documents">
                  <Button className="bg-primary text-primary-foreground hover:opacity-90 font-paragraph">
                    Back to Documents
                  </Button>
                </Link>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                  <div className="flex items-start gap-4">
                    <FileText className="w-12 h-12 text-primary flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <h1 className="font-heading text-4xl md:text-5xl text-textprimary mb-2">
                        {document.documentName}
                      </h1>
                      <div className={`inline-flex items-center px-4 py-2 border font-paragraph text-sm ${getStatusColor(document.processingStatus)}`}>
                        {document.processingStatus || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setIsEditOpen(true)}
                      variant="outline"
                      className="font-paragraph"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={handleDelete}
                      variant="outline"
                      className="font-paragraph text-destructive hover:bg-destructive hover:text-primary-foreground"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-lg text-textprimary">Document Type</h3>
                    </div>
                    <p className="font-paragraph text-base text-gray-600">
                      {document.documentType || 'Not specified'}
                    </p>
                  </div>
                  <div className="border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-lg text-textprimary">Upload Date</h3>
                    </div>
                    <p className="font-paragraph text-base text-gray-600">
                      {document.uploadDate 
                        ? format(new Date(document.uploadDate), 'MMMM dd, yyyy')
                        : 'Not available'}
                    </p>
                  </div>
                  <div className="border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-lg text-textprimary">Last Updated</h3>
                    </div>
                    <p className="font-paragraph text-base text-gray-600">
                      {document._updatedDate 
                        ? format(new Date(document._updatedDate), 'MMMM dd, yyyy')
                        : 'Not available'}
                    </p>
                  </div>
                </div>

                {/* Document File */}
                {document.documentFile && (
                  <div className="border border-gray-200 p-8 mb-12">
                    <h2 className="font-heading text-2xl text-textprimary mb-4">Document File</h2>
                    <div className="flex items-center justify-between">
                      <p className="font-paragraph text-base text-gray-600 break-all">
                        {document.documentFile}
                      </p>
                      <a 
                        href={document.documentFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4"
                      >
                        <Button className="bg-primary text-primary-foreground hover:opacity-90 font-paragraph">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </a>
                    </div>
                  </div>
                )}

                {/* Extracted Text */}
                <div className="border border-gray-200 p-8">
                  <h2 className="font-heading text-2xl text-textprimary mb-4">Extracted Text</h2>
                  {document.extractedText ? (
                    <div className="bg-gray-50 p-6 font-paragraph text-base text-textprimary whitespace-pre-wrap">
                      {document.extractedText}
                    </div>
                  ) : (
                    <p className="font-paragraph text-base text-gray-600">
                      {document.processingStatus === 'processing' 
                        ? 'Text extraction in progress...'
                        : 'No extracted text available'}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Edit Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="editDocumentName" className="font-paragraph">Document Name</Label>
              <Input
                id="editDocumentName"
                value={editForm.documentName}
                onChange={(e) => setEditForm(prev => ({ ...prev, documentName: e.target.value }))}
                placeholder="Enter document name"
                required
                className="font-paragraph"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDocumentType" className="font-paragraph">Document Type</Label>
              <Select 
                value={editForm.documentType} 
                onValueChange={(value) => setEditForm(prev => ({ ...prev, documentType: value }))}
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
              <Label htmlFor="editProcessingStatus" className="font-paragraph">Processing Status</Label>
              <Select 
                value={editForm.processingStatus} 
                onValueChange={(value) => setEditForm(prev => ({ ...prev, processingStatus: value }))}
              >
                <SelectTrigger className="font-paragraph">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editExtractedText" className="font-paragraph">Extracted Text</Label>
              <Textarea
                id="editExtractedText"
                value={editForm.extractedText}
                onChange={(e) => setEditForm(prev => ({ ...prev, extractedText: e.target.value }))}
                placeholder="Enter extracted text"
                rows={8}
                className="font-paragraph"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditOpen(false)}
                className="font-paragraph"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary text-primary-foreground hover:opacity-90 font-paragraph"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
