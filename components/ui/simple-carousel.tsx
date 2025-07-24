import {useState} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import Image from "next/image";
import carouselone from "@/public/carouselone.jpg";

const SimpleCarousel = ({images, alt}: any) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    if (!images || images.length === 0) {
        return <div className="w-[300px] h-[300px] bg-gray-200 rounded"/>;
    }

    return (
        <div className="relative w-[300px] h-[300px]">
            {/* Main Image */}
            <Image
                width={300}
                height={300}
                src={images[currentIndex] || carouselone}
                alt={`${alt} - Image ${currentIndex + 1}`}
                className="w-full h-full object-cover rounded border"
            />

            {/* Navigation Buttons - Only show if more than 1 image */}
            {images.length > 1 && (
                <>
                    {/* Previous Button */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200"
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={20}/>
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200"
                        aria-label="Next image"
                    >
                        <ChevronRight size={20}/>
                    </button>
                </>
            )}

            {/* Dots Indicator - Only show if more than 1 image */}
            {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_: number, index: number) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                index === currentIndex
                                    ? 'bg-white'
                                    : 'bg-white bg-opacity-50 hover:bg-opacity-70'
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SimpleCarousel