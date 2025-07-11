import Image from "next/image";
import { cn, getTechLogos } from "@/lib/utils";

interface TechIconProps {
    techStack: string[];
}

const DisplayTechIcons = async ({ techStack }: TechIconProps) => {
    const techIcons = await getTechLogos(techStack);
    console.log('techIcons in DisplayTechIcons:', techIcons); // Debug log

    // Fallback if techIcons is empty or not an array
    if (!Array.isArray(techIcons) || techIcons.length === 0) {
        return <div>No tech icons available</div>;
    }

    return (
        <div className="flex flex-row">
            {techIcons.slice(0, 3).map(({ tech, url }, index) => (
                <div
                    key={tech}
                    className={cn(
                        "relative group bg-dark-300 rounded-full p-2 flex flex-center",
                        index >= 1 && "-ml-3"
                    )}
                >
                    <span className="tech-tooltip">{tech}</span>
                    <Image
                        src={url}
                        alt={tech}
                        width={100}
                        height={100}
                        className="size-5"
                    />
                </div>
            ))}
        </div>
    );
};

export default DisplayTechIcons;