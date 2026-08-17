"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, RefreshCw, Search, Video, FileText, X, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  getEmpDetails,
  onDateChange,
  onScheduleChange,
  onStartMeeting,
  endMainMeeting,
  saveRemarks
} from "@/server/admission/hutchings/transactions/pre-live-meeting-schedule";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PreMeetingSchedulePage() {
  const [meetingList, setMeetingList] = useState<any[]>([]);
  const [upcomingMeeting, setUpcomingMeeting] = useState<any[]>([]);
  const [startedMeeting, setStartedMeeting] = useState<any[]>([]);
  const [totalMeetingOfDay, setTotalMeetingOfDay] = useState<any[]>([]);
  
  const [plannedDate, setPlannedDate] = useState<Date>(new Date());
  const [selectedTopic, setSelectedTopic] = useState<string>("0");
  const [vcFlag, setVcFlag] = useState<string>("JITSI");
  
  const [searchValue, setSearchValue] = useState("");
  const [searchValue2, setSearchValue2] = useState("");
  
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [activeMeetingDetails, setActiveMeetingDetails] = useState<any>(null);

  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [currentRemarks, setCurrentRemarks] = useState("");
  const [currentGrade, setCurrentGrade] = useState("");
  const [currentMeetingId, setCurrentMeetingId] = useState<number | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const processMeetings = (meetings: any[]) => {
    const upcoming: any[] = [];
    const started: any[] = [];
    
    meetings.forEach((obj: any) => {
      // Time processing logic based on original angular code can be added here if necessary
      if (obj.lmslmeeT_MeetingDate != null && obj.lmslmeeT_MeetingDate !== '') {
        started.push(obj);
      } else {
        upcoming.push(obj);
      }
    });
    
    setUpcomingMeeting(upcoming);
    setStartedMeeting(started);
  };

  const loadInitialData = async () => {
    try {
      const res = await getEmpDetails() as any;
      if (res) {
        setMeetingList(res.meetinglist || []);
        setVcFlag(res.vcflag || "JITSI");
        setTotalMeetingOfDay(res.totalmeetingsofday || []);
        processMeetings(res.meetinglist || []);
      }
    } catch (error) {
      toast.error("Failed to load meetings.");
    }
  };

  const handleDateChange = async (date: Date | undefined) => {
    if (!date) return;
    setPlannedDate(date);
    try {
      const payload = {
        LMSLMEET_PlannedDate: format(date, "yyyy-MM-dd"),
      };
      const res = await onDateChange(payload) as any;
      if (res) {
        setMeetingList(res.meetinglist || []);
        setTotalMeetingOfDay(res.totalmeetingsofday || []);
        setSelectedTopic("0");
        processMeetings(res.meetinglist || []);
      }
    } catch (error) {
      toast.error("Failed to fetch meetings for date.");
    }
  };

  const handleScheduleChange = async (topic: string) => {
    setSelectedTopic(topic);
    try {
      const payload = {
        LMSLMEET_PlannedDate: format(plannedDate, "yyyy-MM-dd"),
        LMSLMEET_MeetingTopic: topic === "0" ? null : topic,
      };
      const res = await onScheduleChange(payload) as any;
      if (res) {
        setMeetingList(res.meetinglist || []);
        processMeetings(res.meetinglist || []);
      }
    } catch (error) {
      toast.error("Failed to fetch schedule.");
    }
  };

  const handleStartMeeting = async (meeting: any, flg: string) => {
    const actionName = flg === "1" ? "re-start" : "start";
    if (confirm(`Do you want to ${actionName} meeting with ${meeting.studentname}?`)) {
      try {
        const res = await onStartMeeting(meeting) as any;
        if (vcFlag === "JITSI") {
          setIsMeetingActive(true);
          setActiveMeetingDetails(meeting);
          initializeJitsi(meeting);
        } else if (vcFlag === "BBB" || vcFlag === "Teams") {
           const meetingUrl = (res.moderatorurl || res.lmslmeeT_MeetingURL) as string;
           window.open(meetingUrl, "_blank");
        }
      } catch (error) {
        toast.error("Failed to start meeting.");
      }
    }
  };

  const handleStopMeeting = async (meetingId: number) => {
    if (confirm("Do you want to end/close meeting?")) {
      try {
        const payload = {
          LMSLMEET_Id: meetingId,
          HRML_LeaveType: "M"
        };
        const res = await endMainMeeting(payload) as any;
        if (res && res.returnval) {
          toast.success("Meeting Completed/Closed!");
          setIsMeetingActive(false);
          setActiveMeetingDetails(null);
          document.getElementById('meet-container')!.innerHTML = "";
          loadInitialData();
        }
      } catch (error) {
        toast.error("Failed to end meeting.");
      }
    }
  };

  const openRemarksModal = (meeting: any) => {
    setCurrentGrade(meeting.studentgrade || "");
    setCurrentRemarks(meeting.studentremarks || "");
    setCurrentMeetingId(meeting.lmslmeeT_Id);
    setRemarksModalOpen(true);
  };

  const handleSaveRemarks = async () => {
    if (!currentGrade || !currentRemarks) {
      toast.warning("Please enter grade and remarks");
      return;
    }
    try {
      const payload = {
        remarks: currentRemarks,
        grade: currentGrade,
        LMSLMEET_Id: currentMeetingId
      };
      const res = await saveRemarks(payload) as any;
      if (res && res.returnval) {
        toast.success("Remarks updated successfully");
        setRemarksModalOpen(false);
        loadInitialData();
      } else {
        toast.error("Remarks Not Saved");
      }
    } catch (error) {
      toast.error("Failed to save remarks");
    }
  };

  const initializeJitsi = (meeting: any) => {
    const domain = 'meet.jit.si';
    const options = {
        roomName: meeting.lmslmeeT_MeetingId,
        parentNode: document.querySelector('#meet-container'),
        userInfo: {
            displayName: meeting.intname || "Staff"
        },
        interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
        }
    };
    if ((window as any).JitsiMeetExternalAPI) {
      new (window as any).JitsiMeetExternalAPI(domain, options);
    } else {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => {
        new (window as any).JitsiMeetExternalAPI(domain, options);
      };
      document.body.appendChild(script);
    }
  };

  const filteredUpcoming = upcomingMeeting.filter(m => m.studentname?.toLowerCase().includes(searchValue.toLowerCase()));
  const filteredStarted = startedMeeting.filter(m => m.studentname?.toLowerCase().includes(searchValue2.toLowerCase()));

  return (
    <div className="container mx-auto p-4 space-y-6">
      {!isMeetingActive ? (
        <Card>
          <CardHeader className="border-b bg-primary/5">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-lg">Scheduled Date:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className="w-[200px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {plannedDate ? format(plannedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={plannedDate}
                      onSelect={(date) => handleDateChange(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {totalMeetingOfDay.length > 0 && (
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-lg">Schedule list:</span>
                  <Select value={selectedTopic} onValueChange={handleScheduleChange}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="All Schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All Schedule</SelectItem>
                      {totalMeetingOfDay.map((opt, i) => (
                        <SelectItem key={i} value={opt.LMSLMEET_MeetingTopic}>{opt.LMSLMEET_MeetingTopic}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button onClick={() => loadInitialData()} variant="outline" className="bg-blue-50">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Meetings Column */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-muted/30 p-2 rounded-md">
                <h3 className="font-bold text-lg text-primary">UPCOMING MEETINGS</h3>
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold">Total: {upcomingMeeting.length}</span>
              </div>
              
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search upcoming..."
                  className="pl-8"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredUpcoming.map((mm, index) => (
                  <Card key={index} className="border-t-4 border-t-blue-500 shadow-sm">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm"><b>NAME:</b> <span className="text-blue-700 font-bold text-base">{mm.studentname}</span></p>
                          <p className="text-sm"><b>MEETING:</b> <span className="text-indigo-600 font-semibold">{mm.lmslmeeT_MeetingTopic}</span></p>
                          <p className="text-sm"><b>REG. NO.:</b> <span className="text-blue-700 font-semibold">{mm.PASR_RegistrationNo}</span> <b>- CLASS:</b> <span className="text-indigo-600 font-semibold">{mm.asmcL_ClassName}</span></p>
                        </div>
                        <span className="text-muted-foreground font-bold text-sm">({index + 1})</span>
                      </div>
                      
                      <div className="text-sm bg-muted/30 p-2 rounded-md mt-2">
                        <b>DATE/TIME:</b> <span className="font-semibold">{mm.lmslmeeT_PlannedDate ? format(new Date(mm.lmslmeeT_PlannedDate), 'dd-MM-yyyy') : ''} -- ({mm.lmslmeeT_PlannedStartTime} To {mm.lmslmeeT_PlannedEndTime})</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => openRemarksModal(mm)}>
                          <FileText className="h-4 w-4 mr-1" /> Remarks
                        </Button>
                        <Button size="sm" onClick={() => handleStartMeeting(mm, '0')} className="bg-green-600 hover:bg-green-700">
                          <Video className="h-4 w-4 mr-1" /> START / JOIN
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredUpcoming.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground border rounded-md border-dashed">
                    No upcoming meetings found.
                  </div>
                )}
              </div>
            </div>

            {/* Started Meetings Column */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-muted/30 p-2 rounded-md">
                <h3 className="font-bold text-lg text-primary">JOIN/RE-START MEETINGS</h3>
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold">Total: {startedMeeting.length}</span>
              </div>
              
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search started..."
                  className="pl-8"
                  value={searchValue2}
                  onChange={(e) => setSearchValue2(e.target.value)}
                />
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredStarted.map((mm, index) => (
                  <Card key={index} className="border-t-4 border-t-green-500 shadow-sm">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm"><b>NAME:</b> <span className="text-blue-700 font-bold text-base">{mm.studentname}</span></p>
                          <p className="text-sm"><b>MEETING:</b> <span className="text-indigo-600 font-semibold">{mm.lmslmeeT_MeetingTopic}</span></p>
                          <p className="text-sm"><b>REG. NO.:</b> <span className="text-blue-700 font-semibold">{mm.PASR_RegistrationNo}</span> <b>- CLASS:</b> <span className="text-indigo-600 font-semibold">{mm.asmcL_ClassName}</span></p>
                        </div>
                        <span className="text-muted-foreground font-bold text-sm">({index + 1})</span>
                      </div>
                      
                      <div className="text-sm bg-muted/30 p-2 rounded-md mt-2">
                        <b>DATE/TIME:</b> <span className="font-semibold">{mm.lmslmeeT_PlannedDate ? format(new Date(mm.lmslmeeT_PlannedDate), 'dd-MM-yyyy') : ''} -- ({mm.lmslmeeT_PlannedStartTime} To {mm.lmslmeeT_PlannedEndTime})</span>
                        <br/>
                        {mm.lmslmeeT_MeetingDate && (
                          <span className="text-green-700"><b>STARTED:</b> {format(new Date(mm.lmslmeeT_MeetingDate), 'dd-MM-yyyy')} -- ({mm.lmslmeeT_StartedTime})</span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-2 justify-end border-t mt-2">
                        <Button size="sm" variant="destructive" onClick={() => handleStopMeeting(mm.lmslmeeT_Id)}>
                          <X className="h-4 w-4 mr-1" /> END
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openRemarksModal(mm)}>
                          <FileText className="h-4 w-4 mr-1" /> Remarks
                        </Button>
                        <Button size="sm" onClick={() => handleStartMeeting(mm, '1')} className="bg-green-600 hover:bg-green-700">
                          <Video className="h-4 w-4 mr-1" /> RE-START
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredStarted.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground border rounded-md border-dashed">
                    No started meetings found.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between bg-primary/5 pb-4">
            <div>
              <CardTitle className="text-xl">MEETING TOPIC: <span className="text-red-500">{activeMeetingDetails?.lmslmeeT_MeetingTopic}</span></CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => openRemarksModal(activeMeetingDetails)}>
                <FileText className="mr-2 h-4 w-4" /> Remarks
              </Button>
              <Button variant="destructive" onClick={() => handleStopMeeting(activeMeetingDetails?.lmslmeeT_Id)}>
                <X className="mr-2 h-4 w-4" /> End Meeting
              </Button>
              <Button variant="secondary" onClick={() => {
                setIsMeetingActive(false);
                document.getElementById('meet-container')!.innerHTML = "";
              }}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div id="meet-container" style={{ height: "600px", width: "100%" }}></div>
          </CardContent>
        </Card>
      )}

      {/* Remarks Modal */}
      <Dialog open={remarksModalOpen} onOpenChange={setRemarksModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>STUDENT REMARKS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="grade" className="text-base font-semibold">Student Grade <span className="text-destructive">*</span></Label>
              <Input 
                id="grade" 
                value={currentGrade} 
                onChange={(e) => setCurrentGrade(e.target.value)} 
                placeholder="Enter Student Grade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks" className="text-base font-semibold">Remarks <span className="text-destructive">*</span></Label>
              <Textarea 
                id="remarks" 
                rows={4}
                value={currentRemarks} 
                onChange={(e) => setCurrentRemarks(e.target.value)} 
                placeholder="Enter Student Remarks.....!!"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemarksModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRemarks} className="bg-primary">
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
