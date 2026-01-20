/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: documents
 * Interface for Documents
 */
export interface Documents {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType url */
  documentFile?: string;
  /** @wixFieldType text */
  documentName?: string;
  /** @wixFieldType datetime */
  uploadDate?: Date | string;
  /** @wixFieldType text */
  documentType?: string;
  /** @wixFieldType text */
  processingStatus?: string;
  /** @wixFieldType text */
  extractedText?: string;
}
