interface HeadingProps {
    title: string;
    description: string;
}

export const Heading: React.FC<HeadingProps> = ({ title, description }) => {
    return (
        <div>
            <h4>{title}</h4>
            <p className='text-muted-foreground text-sm'>{description}</p>
        </div>
    );
};
