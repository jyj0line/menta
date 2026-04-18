type CandyProps = {
    title: React.ReactNode;
    details: React.ReactNode;

    warning?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}
export const Candy = ({
    title, details,
    warning, children, className
}: CandyProps) => {
    return (
      <div className={`flex flex-col items-center whitespace-pre-wrap p-(--spacing-48) border-(length:--lne-10) ${className}`}>
        <h1 className="ut-txt-head">{title}</h1>
        {warning && <h2 className="text-txt-dng mt-crack-mt4">{warning}</h2>}
        <p className="ut-txt-sub mt-crack-mt4">{details}</p>
        {children}
      </div>
    );
}