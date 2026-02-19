'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { chatGPT, whatsAppCall, languageTranslator } from '@/server/intelligent-apps';

export function IntelligentAppsMenu() {
    const [openDialog, setOpenDialog] = useState<string | null>(null);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className='flex cursor-pointer items-center gap-1'>
                        <Sparkles className='text-muted-foreground' size={16} />
                        <p className='text-sm font-medium'>Intelligent Apps</p>
                        <ChevronDown className='text-muted-foreground' size={14} />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuItem onSelect={() => setOpenDialog('whatsapp')}>Whatsapp</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setOpenDialog('chatgpt')}>ChatGPT</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setOpenDialog('translator')}>Language Translator</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setOpenDialog('pdf')}>PDF Converter</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setOpenDialog('tour')}>360 Degree Tour</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <WhatsAppDialog open={openDialog === 'whatsapp'} onOpenChange={(open) => !open && setOpenDialog(null)} />
            <ChatGPTDialog open={openDialog === 'chatgpt'} onOpenChange={(open) => !open && setOpenDialog(null)} />
            <LanguageTranslatorDialog open={openDialog === 'translator'} onOpenChange={(open) => !open && setOpenDialog(null)} />
            <PdfConverterDialog open={openDialog === 'pdf'} onOpenChange={(open) => !open && setOpenDialog(null)} />
            <TourDialog open={openDialog === 'tour'} onOpenChange={(open) => !open && setOpenDialog(null)} />
        </>
    );
}

// ... other components ...

function LanguageTranslatorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [fromLang, setFromLang] = useState('en');
    const [toLang, setToLang] = useState('fr');
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setInputText('');
            setTranslatedText('');
        }
    }, [open]);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' },
        { code: 'kn', name: 'Kannada' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'es', name: 'Spanish' },
        { code: 'ja', name: 'Japanese' },
        { code: 'zh-Hans', name: 'Chinese (Simplified)' },
        { code: 'ru', name: 'Russian' },
        { code: 'ar', name: 'Arabic' }
    ];

    const handleTranslate = async () => {
        if (!inputText.trim()) return;
        setLoading(true);
        try {
            const result = await languageTranslator({
                fromlanguage: fromLang,
                tolanguage: toLang,
                fromsource: inputText,
                source: "source" // Placeholder as per C# structure if needed
            });

            if (result.translateddata && result.translateddata.length > 0) {
                setTranslatedText(result.translateddata[0]);
            } else {
                setTranslatedText("Translation failed or no result returned.");
            }
        } catch (e) {
            setTranslatedText("Error occurred during translation.");
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Language Translator</DialogTitle>
                    <DialogDescription>Translate text between languages.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label>Text to Translate</Label>
                        <Textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Enter text here..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Translated Text</Label>
                        <div className="min-h-[100px] p-3 rounded-md border bg-muted text-sm whitespace-pre-wrap">
                            {translatedText || <span className="text-muted-foreground italic">Translation will appear here...</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>From</Label>
                            <Select value={fromLang} onValueChange={setFromLang}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map(l => (
                                        <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>To</Label>
                            <Select value={toLang} onValueChange={setToLang}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map(l => (
                                        <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleTranslate} disabled={loading || !inputText.trim()}>
                        {loading ? 'Translating...' : 'Translate'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ChatGPTDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
        { role: 'assistant', content: 'Hi, welcome to ChatGPT! You can ask anything.' }
    ]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMessage = message;
        setMessage('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const result = await chatGPT({ message: userMessage });
            const aiResponse = result.ChatCompletion || 'No response';
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error occurred' }]);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col p-0 gap-0">
                <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
                    <DialogTitle className="text-center font-semibold text-lg">AIVRM chatgpt</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                                }`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-muted rounded-lg px-4 py-2 text-sm text-muted-foreground">
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t mt-auto">
                    <div className="flex gap-2 items-end">
                        <Textarea
                            placeholder="Message ChatGPT..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[20px] max-h-[100px] resize-none py-2 px-3 flex-1 text-sm leading-tight"
                            rows={1}
                            style={{ height: '38px', minHeight: '38px' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <Button size="icon" onClick={handleSend} disabled={loading || !message.trim()} className="h-[38px] w-[38px] shrink-0 rounded-full">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-current">
                                <path d="M5.25 12H18.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 5.25L18.75 12L12 18.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Button>
                    </div>
                    <div className="text-center text-[10px] text-muted-foreground mt-2">
                        ChatGPT can make mistakes. Consider checking important information.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function WhatsAppDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [type, setType] = useState('Birthday');
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const [fields, setFields] = useState<Record<string, string>>({});

    const handleSend = async () => {
        if (!mobile) {
            alert('Mobile number is required');
            return;
        }
        setLoading(true);
        // Using 'any' to construct the DTO dynamically
        const data: any = {
            MobileNumber: mobile,
            Typedropdown: type,
            ...fields
        };
        try {
            const res = await whatsAppCall(data);
            if (res === 'success') {
                alert('Message sent successfully!');
                onOpenChange(false);
            } else {
                alert('Failed to send message.');
            }
        } catch (e) {
            alert('Error sending message');
        }
        setLoading(false);
    };

    const renderFields = () => {
        switch (type) {
            case 'Birthday':
                return (
                    <>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Name</Label>
                            <Input value={fields.BirthdayName || ''} onChange={(e) => setFields({ ...fields, BirthdayName: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Institute</Label>
                            <Input value={fields.InstituteNameB || ''} onChange={(e) => setFields({ ...fields, InstituteNameB: e.target.value })} className="col-span-3" />
                        </div>
                    </>
                );
            case 'Attendance':
                return [1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Att {i}</Label>
                        <Input value={fields[`Attendance${i}`] || ''} onChange={(e) => setFields({ ...fields, [`Attendance${i}`]: e.target.value })} className="col-span-3" />
                    </div>
                ));
            case 'FeeDue':
                return (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Due Amount</Label>
                        <Input value={fields.FeeDue || ''} onChange={(e) => setFields({ ...fields, FeeDue: e.target.value })} className="col-span-3" />
                    </div>
                );
            case 'FeeTransaction':
                return [1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Trans {i}</Label>
                        <Input value={fields[`FeeTransaction${i}`] || ''} onChange={(e) => setFields({ ...fields, [`FeeTransaction${i}`]: e.target.value })} className="col-span-3" />
                    </div>
                ));
            case 'LoginCredentials':
            default:
                if (type === 'Board') return <div>No specific parameters configured for Board.</div>;
                return [1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Cred {i}</Label>
                        <Input value={fields[`LoginCredentials${i}`] || ''} onChange={(e) => setFields({ ...fields, [`LoginCredentials${i}`]: e.target.value })} className="col-span-3" />
                    </div>
                ));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>WhatsApp Sender</DialogTitle>
                    <DialogDescription>Send template messages via WhatsApp.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mobile" className="text-right">Mobile</Label>
                        <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} className="col-span-3" placeholder="Number (e.g. 9199...)" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Select value={type} onValueChange={(val) => { setType(val); setFields({}); }}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Birthday">Birthday</SelectItem>
                                <SelectItem value="Attendance">Attendance</SelectItem>
                                <SelectItem value="FeeDue">Fee Due</SelectItem>
                                <SelectItem value="FeeTransaction">Fee Transaction</SelectItem>
                                <SelectItem value="LoginCredentials">Login Credentials</SelectItem>
                                <SelectItem value="Board">Board</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {renderFields()}
                </div>
                <DialogFooter>
                    <Button onClick={handleSend} disabled={loading}>
                        {loading ? 'Sending...' : 'Send'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function TourDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] h-[600px] flex flex-col items-center">
                <DialogHeader className="w-full text-center relative">
                    <DialogTitle>360 Virtual Tour</DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-10 top-0"
                        onClick={() => window.open('https://www.immersivetourz.com/hutchingshighschool/index.html', '_blank')}
                        title="Open in Full Screen"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 21H3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M21 3L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3 21L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Button>
                </DialogHeader>
                <div className="w-full flex-1 flex flex-col items-center justify-center p-4">
                    <iframe
                        src="https://www.immersivetourz.com/hutchingshighschool/index.html"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                    ></iframe>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function PdfConverterDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [textPreview, setTextPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getFileType = (file: File) => {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type === 'text/plain') return 'text';
        return 'other';
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));

            if (selectedFile.type === 'text/plain') {
                const text = await selectedFile.text();
                setTextPreview(text.substring(0, 500)); // Preview first 500 chars
            } else {
                setTextPreview(null);
            }
        }
    };

    const handleCancel = () => {
        setFile(null);
        setPreviewUrl(null);
        setTextPreview(null);
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handlePreview = () => {
        if (previewUrl) {
            window.open(previewUrl, '_blank');
        }
    };

    const convertToPDF = async () => {
        if (!file) {
            alert('Please select a file');
            return;
        }

        setLoading(true);
        try {
            const { jsPDF } = await import('jspdf');

            if (file.type === 'text/plain') {
                const text = await file.text();
                const doc = new jsPDF();
                doc.setFontSize(12);
                const splitText = doc.splitTextToSize(text, 180);
                doc.text(splitText, 10, 10);
                doc.save(`${file.name.replace(/\.[^/.]+$/, "")}.pdf`);
            } else if (file.type.startsWith('image/')) {
                const img = new Image();
                img.src = previewUrl!;
                await new Promise((resolve) => { img.onload = resolve; });

                const doc = new jsPDF();
                const imgProps = doc.getImageProperties(img);
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                doc.addImage(img, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                doc.save(`${file.name.replace(/\.[^/.]+$/, "")}.pdf`);
            } else {
                alert('Unsupported file type. Please select text, png, or jpeg.');
            }
        } catch (error) {
            console.error('Error creating PDF:', error);
            alert('Error creating PDF');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Pdf Converter</DialogTitle>
                </DialogHeader>
                <div className="p-4 border rounded-md">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 text-center border-r pr-4">
                            <label htmlFor="fileInput" className="cursor-pointer block p-4 border-2 border-dashed rounded-md hover:bg-slate-50 relative">
                                <input
                                    id="fileInput"
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".txt,.png,.jpg,.jpeg,.jfif"
                                    className="hidden"
                                />
                                <div className="text-sm">
                                    <span className="text-red-500 font-bold">*</span> Select .jpg, .jfif, .jpeg, .png, .txt file
                                </div>
                                {file && <div className="text-xs text-muted-foreground mt-2 font-medium">{file.name}</div>}
                            </label>
                        </div>

                        <div className="flex flex-col items-center justify-center border-r px-6 min-w-[200px]">
                            {file ? (
                                <div className="text-center cursor-pointer hover:opacity-80 flex flex-col items-center" onClick={handlePreview} title="Click to open full preview">
                                    {getFileType(file) === 'image' && previewUrl ? (
                                        <div className="h-20 w-20 mb-2 border rounded overflow-hidden shadow-sm">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    ) : getFileType(file) === 'text' && textPreview ? (
                                        <div className="h-20 w-20 mb-2 border rounded overflow-hidden shadow-sm bg-slate-50 p-1 text-xs text-left whitespace-pre-wrap font-mono">
                                            {textPreview}
                                        </div>
                                    ) : (
                                        <div className="h-20 w-20 mx-auto bg-slate-100 rounded-lg flex items-center justify-center mb-2 border shadow-sm">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
                                                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M8 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M8 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M8 9H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    )}
                                    <p className="text-sm font-medium text-blue-600 underline decoration-dotted underline-offset-4">
                                        <span className="flex items-center gap-1">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Preview {file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}
                                        </span>
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground opacity-50">
                                    <div className="h-20 w-20 mx-auto bg-slate-50 rounded-lg flex items-center justify-center mb-2 border border-dashed">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <p className="text-sm">No File Selected</p>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 flex justify-center pl-4">
                            <Button onClick={convertToPDF} disabled={loading || !file} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                {loading ? (
                                    'Converting...'
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Convert to PDF
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
