// Interface representing a Ticket
export interface Ticket {
  ticketId: string;
}

// Interface representing an Attachment
export interface Attachment {
  id: string;
  ticketId: string | null;
  filePath: string;
  typeOfFile: string;
  fileName: string;
}

/**
 * Fetch all attachments for a specific ticket.
 * @param ticketId - The ID of the ticket.
 * @returns A promise that resolves to an array of attachments.
 * @throws An error if the request fails.
 */
export const getAttachmentsByTicketId = async (ticketId: string): Promise<Attachment[]> => {
  try {
    const response = await fetch(`http://localhost:8080/api/attachments/${ticketId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to fetch attachments. Status:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error fetching attachments:', error);
    throw error;
  }
};

/**
 * Upload an attachment for a specific ticket.
 * @param ticketId - The ID of the ticket.
 * @param file - The file to be uploaded.
 * @returns A promise that resolves to the uploaded attachment details.
 * @throws An error if the upload fails.
 */
export const uploadAttachment = async (ticketId: string, file: File): Promise<Attachment> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("ticketId", ticketId);

  try {
    const response = await fetch("http://localhost:8080/api/attachments/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    return await response.json();
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};