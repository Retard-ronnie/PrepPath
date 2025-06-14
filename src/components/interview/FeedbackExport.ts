import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface FeedbackItem {
  id: string;
  question: string;
  userAnswer: string;
  feedback: string;
  score: number;
  technicalAccuracy?: number;
  completeness?: number;
  clarity?: number;
  strengths?: string[];
  improvements?: string[];
  keywords?: string[];
}

interface InterviewData {
  title: string;
  duration: number;
  totalQuestions: number;
  completedAt: Date;
}

interface ExportData {
  feedbackItems: FeedbackItem[];
  overallScore: number;
  interviewData: InterviewData;
  userInfo?: {
    name?: string;
    email?: string;
  };
}

export const exportToPDF = async (data: ExportData): Promise<void> => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add text with word wrapping
    const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * (fontSize * 0.4));
    };    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Interview Results Report', 20, yPosition);
    yPosition += 15;

    // Interview Info
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Interview: ${data.interviewData.title}`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Date: ${data.interviewData.completedAt.toLocaleDateString()}`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Duration: ${data.interviewData.duration} minutes`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Questions: ${data.interviewData.totalQuestions}`, 20, yPosition);
    yPosition += 15;    // Overall Score
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overall Performance', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    const averageScore = data.feedbackItems.reduce((sum, item) => sum + item.score, 0) / data.feedbackItems.length;
    pdf.text(`Average Score: ${Math.round(averageScore)}%`, 20, yPosition);
    yPosition += 10;

    const getPerformanceLevel = (score: number) => {
      if (score >= 85) return 'Excellent';
      if (score >= 75) return 'Good';
      if (score >= 65) return 'Average';
      return 'Needs Improvement';
    };

    pdf.text(`Performance Level: ${getPerformanceLevel(averageScore)}`, 20, yPosition);
    yPosition += 15;

    // Technical Metrics
    const avgTechnical = data.feedbackItems.reduce((sum, item) => sum + (item.technicalAccuracy || 0), 0) / data.feedbackItems.length;
    const avgCompleteness = data.feedbackItems.reduce((sum, item) => sum + (item.completeness || 0), 0) / data.feedbackItems.length;
    const avgClarity = data.feedbackItems.reduce((sum, item) => sum + (item.clarity || 0), 0) / data.feedbackItems.length;    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Skill Breakdown', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Technical Accuracy: ${Math.round(avgTechnical)}%`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Completeness: ${Math.round(avgCompleteness)}%`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Clarity: ${Math.round(avgClarity)}%`, 20, yPosition);
    yPosition += 15;

    // Strengths and Improvements
    const allStrengths = data.feedbackItems.flatMap(item => item.strengths || []);
    const allImprovements = data.feedbackItems.flatMap(item => item.improvements || []);
    const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);
    const uniqueImprovements = [...new Set(allImprovements)].slice(0, 5);    if (uniqueStrengths.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Strengths', 20, yPosition);
      yPosition += 10;      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      uniqueStrengths.forEach((strength) => {
        yPosition = addText(`• ${strength}`, 25, yPosition, pageWidth - 50);
        yPosition += 2;
      });
      yPosition += 10;
    }    if (uniqueImprovements.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Areas for Improvement', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');uniqueImprovements.forEach((improvement) => {
        yPosition = addText(`• ${improvement}`, 25, yPosition, pageWidth - 50);
        yPosition += 2;
      });
      yPosition += 15;
    }

    // Question-by-Question Analysis
    pdf.addPage();
    yPosition = 20;    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed Question Analysis', 20, yPosition);
    yPosition += 15;

    data.feedbackItems.forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Question ${index + 1} (Score: ${item.score}%)`, 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(item.question, 20, yPosition, pageWidth - 40, 10);
      yPosition += 5;      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Your Answer:', 20, yPosition);
      yPosition += 7;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(item.userAnswer || 'No answer provided', 20, yPosition, pageWidth - 40, 10);
      yPosition += 5;      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Feedback:', 20, yPosition);
      yPosition += 7;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(item.feedback, 20, yPosition, pageWidth - 40, 10);
      yPosition += 15;
    });    // Footer
    const totalPages = pdf.internal.pages.length - 1; // Subtract 1 because pages array includes a null at index 0
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `PrepPath Interview Report - Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    const fileName = `Interview_Report_${data.interviewData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};

export const exportDashboardToPDF = async (elementId: string, fileName: string): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Dashboard element not found');
    }

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      allowTaint: true,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
  } catch (error) {
    console.error('Error exporting dashboard to PDF:', error);
    throw new Error('Failed to export dashboard');
  }
};

export const emailResults = async (data: ExportData, recipientEmail: string): Promise<void> => {
  try {
    // This would typically call a backend API to send the email
    // For now, we'll create a mailto link with the results summary
    const subject = `Interview Results - ${data.interviewData.title}`;
    const body = `
Hello,

Here are your interview results for ${data.interviewData.title}:

Overall Score: ${Math.round(data.feedbackItems.reduce((sum, item) => sum + item.score, 0) / data.feedbackItems.length)}%
Date: ${data.interviewData.completedAt.toLocaleDateString()}
Duration: ${data.interviewData.duration} minutes
Questions Answered: ${data.feedbackItems.length}

For detailed analysis and feedback, please visit your PrepPath dashboard.

Best regards,
PrepPath Team
    `.trim();

    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  } catch (error) {
    console.error('Error creating email:', error);
    throw new Error('Failed to prepare email');
  }
};

export const shareResults = async (data: ExportData): Promise<void> => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: `Interview Results - ${data.interviewData.title}`,
        text: `I scored ${Math.round(data.feedbackItems.reduce((sum, item) => sum + item.score, 0) / data.feedbackItems.length)}% on my ${data.interviewData.title} interview!`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareText = `I scored ${Math.round(data.feedbackItems.reduce((sum, item) => sum + item.score, 0) / data.feedbackItems.length)}% on my ${data.interviewData.title} interview! Check out PrepPath for interview preparation.`;
      
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        alert('Share text copied to clipboard!');
      } else {
        // Further fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Share text copied to clipboard!');
      }
    }
  } catch (error) {
    console.error('Error sharing results:', error);
    throw new Error('Failed to share results');
  }
};
