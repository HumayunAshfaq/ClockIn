import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Calendar } from './components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';
import { Checkbox } from './components/ui/checkbox';
import { Card } from './components/ui/card';
import { Calendar as CalendarIcon, Trash2, Plus, List } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';

interface LoggedDay {
  id: string;
  date: string;
}

export default function App() {
  const [loggedDays, setLoggedDays] = useState<LoggedDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDaysSheetOpen, setIsDaysSheetOpen] = useState(false);
  const [selectedDaysForDelete, setSelectedDaysForDelete] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Load logged days from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('loggedDays');
    if (saved) {
      setLoggedDays(JSON.parse(saved));
    }
  }, []);

  // Save logged days to localStorage
  useEffect(() => {
    localStorage.setItem('loggedDays', JSON.stringify(loggedDays));
  }, [loggedDays]);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isDayLogged = (date: Date) => {
    const dateString = formatDate(date);
    return loggedDays.some(day => day.date === dateString);
  };

  const logDay = (date: Date) => {
    const dateString = formatDate(date);
    
    if (isDayLogged(date)) {
      toast.error('This day is already logged');
      return;
    }

    const newDay: LoggedDay = {
      id: crypto.randomUUID(),
      date: dateString
    };

    setLoggedDays(prev => [...prev, newDay].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
    
    toast.success('Day logged successfully!');
  };

  const logToday = () => {
    logDay(new Date());
  };

  const logPastDay = () => {
    if (selectedDate) {
      logDay(selectedDate);
      setSelectedDate(undefined);
      setIsCalendarOpen(false);
    }
  };

  const toggleDaySelection = (id: string) => {
    const newSet = new Set(selectedDaysForDelete);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedDaysForDelete(newSet);
  };

  const deleteSingleDay = (id: string) => {
    setLoggedDays(prev => prev.filter(day => day.id !== id));
    toast.success('Day deleted');
  };

  const deleteSelectedDays = () => {
    setLoggedDays(prev => prev.filter(day => !selectedDaysForDelete.has(day.id)));
    toast.success(`${selectedDaysForDelete.size} day(s) deleted`);
    setSelectedDaysForDelete(new Set());
    setIsDeleteDialogOpen(false);
  };

  const selectAllDays = () => {
    setSelectedDaysForDelete(new Set(loggedDays.map(day => day.id)));
  };

  const deselectAllDays = () => {
    setSelectedDaysForDelete(new Set());
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <Toaster />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        h1 {
          font-family: 'Space Grotesk', sans-serif !important;
        }
      `}</style>
      
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-violet-400 via-purple-500 to-violet-600 bg-clip-text text-transparent text-[36px] font-bold drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]">Day Logger</h1>
          <p className="text-muted-foreground">Track your days</p>
        </div>

        {/* Main Log Today Button */}
        <div className="mb-6">
          <Button 
            onClick={logToday}
            className="w-full h-14 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-700 hover:via-purple-700 hover:to-violet-800 text-white shadow-lg shadow-violet-500/50 rounded-2xl transition-all hover:shadow-violet-500/70 hover:scale-[1.02]"
            size="lg"
          >
            <CalendarIcon className="mr-2 h-5 w-5" />
            Log Today
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="h-12 border-2 hover:border-primary hover:bg-primary/10 rounded-xl transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Past Day
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Select a Date</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date > new Date() || isDayLogged(date)}
                  className="rounded-md border"
                />
                <Button 
                  onClick={logPastDay} 
                  disabled={!selectedDate}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                >
                  Log Selected Day
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Sheet open={isDaysSheetOpen} onOpenChange={setIsDaysSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline"
                className="h-12 border-2 hover:border-primary hover:bg-primary/10 rounded-xl transition-all"
              >
                <List className="mr-2 h-4 w-4" />
                View Days ({loggedDays.length})
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Logged Days</SheetTitle>
              </SheetHeader>
              
              {loggedDays.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <CalendarIcon className="h-16 w-16 mb-4 opacity-30" />
                  <p>No days logged yet</p>
                </div>
              ) : (
                <div className="mt-6">
                  {/* Multi-select controls */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={selectAllDays}
                      >
                        Select All
                      </Button>
                      {selectedDaysForDelete.size > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={deselectAllDays}
                        >
                          Deselect All
                        </Button>
                      )}
                    </div>
                    {selectedDaysForDelete.size > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete ({selectedDaysForDelete.size})
                      </Button>
                    )}
                  </div>

                  {/* Days list */}
                  <div className="space-y-2 overflow-y-auto max-h-[calc(85vh-200px)]">
                    {loggedDays.map((day) => (
                      <Card 
                        key={day.id}
                        className={`p-4 transition-colors rounded-xl ${
                          selectedDaysForDelete.has(day.id) 
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              checked={selectedDaysForDelete.has(day.id)}
                              onCheckedChange={() => toggleDaySelection(day.id)}
                            />
                            <div>
                              <p>{formatDisplayDate(day.date)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSingleDay(day.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        {/* Stats Card */}
        <Card className="p-6 bg-card/80 backdrop-blur rounded-2xl">
          <div className="text-center">
            <p className="text-muted-foreground mb-1">Total Days Logged</p>
            <p className="bg-gradient-to-r from-violet-400 via-purple-500 to-violet-600 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{loggedDays.length}</p>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedDaysForDelete.size} day(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected days will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSelectedDays} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
