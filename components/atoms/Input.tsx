export type InputProps = {
    idName: string;
    ariaDescribedby: string;
    type: "text" | "password" | "email";
    placeholder: string;
    maxLength: number;
    
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    className?: string;
}
export const Input = (
    ({ idName, ariaDescribedby, type, placeholder, maxLength, value, onChange, onBlur, className }: InputProps) => {
    return (
        <input
            id={idName}
            name={idName}
            aria-describedby={ariaDescribedby}
            type={type}
            placeholder={placeholder}
            maxLength={maxLength}

            value={value}
            onChange={onChange}
            onBlur={onBlur}
            
            className={className}
        />
    )
});