import { Calendar, Download, ExternalLink } from 'lucide-react';
import { Event } from '../types';
import { format } from 'date-fns';

interface CalendarIntegrationProps {
  event: Event;
}

export function CalendarIntegration({ event }: CalendarIntegrationProps) {
  // Format date for calendar
  const formatDateForCalendar = (date: string, time: string): string => {
    const [year, month, day] = date.split('-');
    const [hours, minutes] = time.split(':');
    return `${year}${month}${day}T${hours}${minutes}00`;
  };

  const startDateTime = formatDateForCalendar(event.date, event.time);
  const endTime = event.endTime || `${parseInt(event.time.split(':')[0]) + 2}:${event.time.split(':')[1]}`;
  const endDateTime = formatDateForCalendar(event.date, endTime);

  // Generate Google Calendar URL
  const generateGoogleCalendarUrl = (): string => {
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDateTime}/${endDateTime}`,
      details: event.description,
      location: event.venue,
      sf: 'true'
    });
    return `${baseUrl}?${params.toString()}`;
  };

  // Generate Outlook Calendar URL
  const generateOutlookCalendarUrl = (): string => {
    const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
    const startDate = new Date(`${event.date}T${event.time}`);
    const endDate = new Date(`${event.date}T${endTime}`);
    
    const params = new URLSearchParams({
      subject: event.title,
      body: event.description,
      location: event.venue,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      path: '/calendar/action/compose',
      rru: 'addevent'
    });
    return `${baseUrl}?${params.toString()}`;
  };

  // Generate ICS file content
  const generateICSContent = (): string => {
    const formatICSDate = (date: string, time: string): string => {
      return formatDateForCalendar(date, time);
    };

    const escapeText = (text: string): string => {
      return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
    };

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Smart Campus Events//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${formatICSDate(event.date, event.time)}`,
      `DTEND:${formatICSDate(event.date, endTime)}`,
      `SUMMARY:${escapeText(event.title)}`,
      `DESCRIPTION:${escapeText(event.description)}`,
      `LOCATION:${escapeText(event.venue)}`,
      `UID:${event.id}@smartcampusevents.com`,
      `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    return lines.join('\r\n');
  };

  // Download ICS file
  const downloadICS = () => {
    const icsContent = generateICSContent();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">Add to Calendar</h3>
      </div>

      <div className="space-y-2">
        <a
          href={generateGoogleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <span className="font-medium text-gray-700">Google Calendar</span>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        </a>

        <a
          href={generateOutlookCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="#0078D4" d="M24 7.387v10.478c0 .23-.08.424-.238.576a.776.776 0 01-.574.234h-8.234v-6.09l1.617 1.203c.086.063.187.095.297.095.11 0 .209-.032.297-.095L24 7.387zm-.812-1.062L16.47 11.5l-1.516-1.125V4.688h8.234c.23 0 .424.078.574.234.158.152.238.34.238.576v.827zM14.203 3.188v9.562l-7.078 5.25L.812 13.875V4.688a.776.776 0 01.234-.574A.776.776 0 011.625 3.875h12.578v-.687zm-7.078 10.875l5.578-4.126-5.578 2.063-5.578-2.063 5.578 4.126z"/>
              </svg>
            </div>
            <span className="font-medium text-gray-700">Outlook Calendar</span>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        </a>

        <button
          onClick={downloadICS}
          className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="font-medium text-gray-700">Download .ics File</span>
          </div>
          <Download className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Works with Apple Calendar, Yahoo Calendar, and more
      </p>
    </div>
  );
}
