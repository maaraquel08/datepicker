import { DatePicker } from "@/components/date-picker";

export default function Home() {
    return (
        <div className="flex justify-start items-start h-screen max-w-md mx-auto py-32">
            <DatePicker
                selected={new Date(2024, 0, 18)}
                events={[new Date(2024, 0, 17)]}
            />
        </div>
    );
}
