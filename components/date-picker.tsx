"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type DatePickerProps = {
    selected?: Date;
    onSelect?: (date: Date) => void;
    events?: Date[];
    className?: string;
};

type ViewMode = "days" | "months" | "years";

// Reusable Header Button Component
interface HeaderButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

function HeaderButton({ children, className, ...props }: HeaderButtonProps) {
    return (
        <Button
            variant="outline"
            size="sm"
            className={cn("px-2 py-1", className)} // Remove h-auto, rely on size="sm" for consistent height
            {...props}
        >
            {children}
        </Button>
    );
}

export function DatePicker({
    selected,
    onSelect,
    events = [],
    className,
}: DatePickerProps) {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(
        selected || null
    );
    const [viewMode, setViewMode] = React.useState<ViewMode>("days");
    const [direction, setDirection] = React.useState<"left" | "right">("right");
    const [isViewTransition, setIsViewTransition] = React.useState(false);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = React.useState<number | null>(
        null
    );

    const months = [
        { name: "Jan", value: 0 },
        { name: "Feb", value: 1 },
        { name: "Mar", value: 2 },
        { name: "Apr", value: 3 },
        { name: "May", value: 4 },
        { name: "Jun", value: 5 },
        { name: "Jul", value: 6 },
        { name: "Aug", value: 7 },
        { name: "Sep", value: 8 },
        { name: "Oct", value: 9 },
        { name: "Nov", value: 10 },
        { name: "Dec", value: 11 },
    ] as const;

    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const isCurrentYear = currentYear === today.getFullYear();

    const years = React.useMemo(() => {
        const startYear = currentYear - 6;
        return Array.from({ length: 12 }, (_, i) => startYear + i);
    }, [currentYear]);

    React.useEffect(() => {
        if (selected) {
            setSelectedDate(selected);
        }
    }, [selected]);

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        onSelect?.(date);
    };

    const handleMonthClick = (month: number) => {
        setIsViewTransition(true);
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setMonth(month);
            return newDate;
        });
        setViewMode("days");
    };

    const handleYearClick = (year: number) => {
        setIsViewTransition(true);
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setFullYear(year);
            return newDate;
        });
        setViewMode("days");
    };

    const isDateSelected = (date: Date) => {
        return (
            selectedDate && date.toDateString() === selectedDate.toDateString()
        );
    };

    const isDateEvent = (date: Date) => {
        return events.some((d) => d.toDateString() === date.toDateString());
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = getFirstDayOfMonth(year, month);

        const prevMonthDays = firstDayOfMonth;
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevMonthYear = month === 0 ? year - 1 : year;
        const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

        const calendarDays = [];

        // Previous month days
        for (let i = 0; i < prevMonthDays; i++) {
            const day = daysInPrevMonth - prevMonthDays + i + 1;
            const date = new Date(prevMonthYear, prevMonth, day);
            calendarDays.push({ date, currentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            calendarDays.push({ date, currentMonth: true });
        }

        // Next month days
        const remainingDays = 42 - calendarDays.length; // 6 rows of 7 days
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextMonthYear = month === 11 ? year + 1 : year;

        for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(nextMonthYear, nextMonth, i);
            calendarDays.push({ date, currentMonth: false });
        }

        const weeks = [];
        for (let i = 0; i < calendarDays.length; i += 7) {
            weeks.push(calendarDays.slice(i, i + 7));
        }

        return weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
                {week.map(({ date, currentMonth }, dayIndex) => {
                    const isSelected = isDateSelected(date);
                    const hasEvent = isDateEvent(date);
                    const isTodayDate = isToday(date);

                    return (
                        <td key={dayIndex} className={cn("p-0")}>
                            <button
                                type="button"
                                className={cn(
                                    "h-12 w-full p-0 font-normal flex items-center justify-center transition-colors duration-200",
                                    currentMonth
                                        ? "text-foreground"
                                        : "text-muted-foreground",
                                    isSelected &&
                                        "bg-green-600 text-white rounded-md",
                                    !isSelected &&
                                        "hover:bg-gray-50 rounded-md",
                                    hasEvent && !isSelected && "relative",
                                    isTodayDate &&
                                        !isSelected &&
                                        "text-green-600"
                                )}
                                onClick={() => handleDateClick(date)}
                            >
                                <div className="relative flex flex-col items-center">
                                    {isTodayDate && !isSelected && (
                                        <div className="absolute -top-1.5 h-1 w-1 rounded-full bg-green-600" />
                                    )}
                                    {date.getDate()}
                                    {hasEvent && !isSelected && (
                                        <div className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-green-600" />
                                    )}
                                </div>
                            </button>
                        </td>
                    );
                })}
            </tr>
        ));
    };

    const renderMonthSelector = () => {
        const months = [
            { name: "Jan", value: 0 },
            { name: "Feb", value: 1 },
            { name: "Mar", value: 2 },
            { name: "Apr", value: 3 },
            { name: "May", value: 4 },
            { name: "Jun", value: 5 },
            { name: "Jul", value: 6 },
            { name: "Aug", value: 7 },
            { name: "Sep", value: 8 },
            { name: "Oct", value: 9 },
            { name: "Nov", value: 10 },
            { name: "Dec", value: 11 },
        ];

        const currentMonth = currentDate.getMonth();
        const today = new Date();
        const isCurrentYear = currentDate.getFullYear() === today.getFullYear();

        return (
            <div className="grid grid-cols-4 gap-2">
                {months.map((month) => (
                    <button
                        key={month.value}
                        type="button"
                        className={cn(
                            "h-16 rounded-lg border p-2 text-center transition-all duration-200 hover:bg-gray-50 hover:scale-105",
                            currentMonth === month.value &&
                                "bg-green-600 text-white",
                            isCurrentYear &&
                                today.getMonth() === month.value &&
                                !(currentMonth === month.value) &&
                                "border-green-600",
                            currentMonth !== month.value &&
                                "hover:bg-gray-50 hover:scale-105"
                        )}
                        onClick={() => handleMonthClick(month.value)}
                    >
                        {month.name}
                    </button>
                ))}
            </div>
        );
    };

    const renderYearSelector = () => {
        const currentYear = currentDate.getFullYear();
        const startYear = currentYear - 6;
        const years = Array.from({ length: 12 }, (_, i) => startYear + i);
        const today = new Date();

        return (
            <div className="grid grid-cols-4 gap-2">
                {years.map((year) => (
                    <button
                        key={year}
                        type="button"
                        className={cn(
                            "h-16 rounded-lg border p-2 text-center transition-all duration-200",
                            currentYear === year && "bg-green-600 text-white",
                            today.getFullYear() === year &&
                                !(currentYear === year) &&
                                "border-green-600",
                            currentYear !== year &&
                                "hover:bg-gray-50 hover:scale-105"
                        )}
                        onClick={() => handleYearClick(year)}
                    >
                        {year}
                    </button>
                ))}
            </div>
        );
    };

    const navigate = (direction: "prev" | "next") => {
        setIsViewTransition(false);
        setDirection(direction === "prev" ? "right" : "left");
        setCurrentDate((prev) => {
            const newDate = new Date(prev);

            if (viewMode === "days") {
                newDate.setMonth(
                    prev.getMonth() + (direction === "prev" ? -1 : 1)
                );
            } else if (viewMode === "months") {
                newDate.setFullYear(
                    prev.getFullYear() + (direction === "prev" ? -1 : 1)
                );
            } else if (viewMode === "years") {
                newDate.setFullYear(
                    prev.getFullYear() + (direction === "prev" ? -12 : 12)
                );
            }

            return newDate;
        });
    };

    const toggleMonthView = () => {
        setIsViewTransition(true);
        setViewMode(viewMode === "days" ? "months" : "days");
    };

    const toggleYearView = () => {
        setIsViewTransition(true);
        setViewMode(viewMode === "years" ? "months" : "years");
    };

    const handleTodayClick = () => {
        const today = new Date();
        if (
            currentDate.getFullYear() !== today.getFullYear() ||
            currentDate.getMonth() !== today.getMonth()
        ) {
            setIsViewTransition(false);
            // Determine the direction based on the current view and date position
            if (viewMode === "days") {
                // For month view, compare months
                const currentTimestamp = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth()
                ).getTime();
                const todayTimestamp = new Date(
                    today.getFullYear(),
                    today.getMonth()
                ).getTime();
                setDirection(
                    currentTimestamp > todayTimestamp ? "right" : "left"
                );
            } else if (viewMode === "months") {
                // For year view, compare years
                setDirection(
                    currentDate.getFullYear() > today.getFullYear()
                        ? "right"
                        : "left"
                );
            } else {
                // For years view, compare year ranges
                const currentYearStart =
                    Math.floor(currentDate.getFullYear() / 12) * 12;
                const todayYear = today.getFullYear();
                setDirection(currentYearStart > todayYear ? "right" : "left");
            }

            setCurrentDate(today);
            setViewMode("days");
        }
    };

    return (
        <div
            className={cn(
                "w-full rounded-lg border overflow-hidden bg-white",
                className
            )}
        >
            <div className="flex items-center justify-between px-3 py-2 border-b">
                <div className="flex items-center space-x-2">
                    <HeaderButton type="button" onClick={toggleMonthView}>
                        {currentDate.toLocaleString("default", {
                            month: "long",
                        })}
                    </HeaderButton>
                    <HeaderButton type="button" onClick={toggleYearView}>
                        {currentDate.getFullYear()}
                    </HeaderButton>
                </div>
                <div className="flex items-center space-x-1">
                    <HeaderButton
                        type="button"
                        onClick={handleTodayClick}
                        className="mr-1"
                    >
                        Today
                    </HeaderButton>
                    <HeaderButton
                        type="button"
                        onClick={() => navigate("prev")}
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </HeaderButton>
                    <HeaderButton
                        type="button"
                        onClick={() => navigate("next")}
                        aria-label="Next"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </HeaderButton>
                </div>
            </div>

            <div className="overflow-hidden relative h-[336px]">
                <AnimatePresence initial={false} mode="wait" custom={direction}>
                    <motion.div
                        key={`${viewMode}-${currentDate.getMonth()}-${currentDate.getFullYear()}`}
                        ref={contentRef}
                        className="absolute inset-0 p-4"
                        custom={direction}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={{
                            initial: (direction) => ({
                                opacity: 0,
                                x: isViewTransition
                                    ? 0
                                    : direction === "left"
                                    ? 50
                                    : -50,
                            }),
                            animate: {
                                opacity: 1,
                                x: 0,
                                transition: {
                                    duration: 0.2,
                                    ease: "easeInOut",
                                },
                            },
                            exit: (direction) => ({
                                opacity: 0,
                                x: isViewTransition
                                    ? 0
                                    : direction === "left"
                                    ? -50
                                    : 50,
                                transition: {
                                    duration: 0.2,
                                    ease: "easeInOut",
                                },
                            }),
                        }}
                        transition={{
                            duration: 0.2,
                            layout: {
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            },
                        }}
                    >
                        {viewMode === "days" && (
                            <table className="w-full h-full border-collapse">
                                <thead>
                                    <tr>
                                        {[
                                            "Su",
                                            "Mo",
                                            "Tu",
                                            "We",
                                            "Th",
                                            "Fr",
                                            "Sa",
                                        ].map((day) => (
                                            <th
                                                key={day}
                                                className="text-sm font-normal text-muted-foreground"
                                            >
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>{renderCalendar()}</tbody>
                            </table>
                        )}

                        {viewMode === "months" && (
                            <div className="grid grid-cols-4 gap-2 h-full">
                                {months.map((month) => (
                                    <button
                                        key={month.value}
                                        type="button"
                                        className={cn(
                                            "flex items-center justify-center rounded-lg border text-center transition-all duration-200 hover:bg-gray-50 hover:scale-105",
                                            currentMonth === month.value &&
                                                "bg-green-600 text-white",
                                            isCurrentYear &&
                                                today.getMonth() ===
                                                    month.value &&
                                                !(
                                                    currentMonth === month.value
                                                ) &&
                                                "border-green-600",
                                            currentMonth !== month.value &&
                                                "hover:bg-gray-50 hover:scale-105"
                                        )}
                                        onClick={() =>
                                            handleMonthClick(month.value)
                                        }
                                    >
                                        {month.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {viewMode === "years" && (
                            <div className="grid grid-cols-4 gap-2 h-full">
                                {years.map((year) => (
                                    <button
                                        key={year}
                                        type="button"
                                        className={cn(
                                            "flex items-center justify-center rounded-lg border text-center transition-all duration-200",
                                            currentYear === year &&
                                                "bg-green-600 text-white",
                                            today.getFullYear() === year &&
                                                !(currentYear === year) &&
                                                "border-green-600",
                                            currentYear !== year &&
                                                "hover:bg-gray-50 hover:scale-105"
                                        )}
                                        onClick={() => handleYearClick(year)}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
