import React, { useEffect, useState, ChangeEvent } from 'react';
import { getAttachmentsByTicketId, Attachment, uploadAttachment } from '../api/attachment';
import { Ticket } from "../api/ticketApi";
import { fetchTicketById } from '../api/ticketApi';




interface AttachmentsSectionProps {
  ticketId: string;
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({ ticketId }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);

    useEffect(() => {
      const loadTicket = async () => {
        try {
          const data = await fetchTicketById(ticketId); 
          console.log(data);
          
          setTicket(data);
          console.log(data.status);
          
        } catch (error) {
          console.error('Error loading ticket:', error);
        }
      };
  
      loadTicket();
    }, [ticketId]);
    

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const fetchedAttachments = await getAttachmentsByTicketId(ticketId);
        setAttachments(fetchedAttachments);
      } catch (error) {
        console.error("Failed to fetch attachments:", error);
      }
    };
    if (ticketId) {
      fetchAttachments();
    }
  }, []);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadAttachment(ticketId, file);
      const updatedAttachments = await getAttachmentsByTicketId(ticketId);
      setAttachments(updatedAttachments);
      alert(`Attachment "${file.name}" uploaded successfully!`);
    } catch (error) {
      console.error("Failed to upload attachment:", error);
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">Attachments</h3>

      {ticket?.status!=='Closed' ?(<div className="flex items-center space-x-4 mb-4">
        <label className="cursor-pointer inline-block bg-blue-900  text-white text-sm font-medium py-2 px-4 rounded shadow">
          {uploading ? "Uploading..." : "Upload Attachment"}
          <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>):
      (          <div className="text-gray-500 text-sm italic">This ticket is closed. No new attachments can be added.</div>
      )}

      {attachments.length > 0 ? (
        <ul className="bg-gray-100 p-4 rounded shadow">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="flex items-center justify-between py-2 border-b last:border-none">
              <span>{attachment.fileName}</span>
              <a
                href={attachment.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No attachments found for this ticket.</p>
      )}
    </div>
  );
};

export default AttachmentsSection;
