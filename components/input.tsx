import {FormEvent} from 'react';
import styled from 'styled-components';

function titleCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.substring(1);
}

type InputProps = {
    type: string;
    name: string;
    value: number | string;
    required: boolean;
    pattern: string;
    onChange(event: FormEvent<HTMLInputElement>): void;
    onBlur(event: FormEvent<HTMLInputElement>): void;
    autoComplete: string;
    autoFocus: boolean;
    min?: number;
    max?: number;
    disabled: boolean;
};

const Label = styled.label`
    display: block;
    margin-top: 12px;
    margin-bottom: 2px;
`;

const InputBase = styled.input`
    display: block;
    padding: 6px;
    font-size: 16px;

    &[type='submit'] {
        margin-top: 12px;
    }
`;

const noop = (event: FormEvent<HTMLInputElement>) => {};

export const Input = ({
    type,
    name,
    onChange,
    onBlur,
    autoComplete,
    autoFocus,
    value,
    required,
    pattern,
    min,
    max,
    disabled,
}: InputProps) => {
    const labelText = titleCase(name);

    return (
        <Label>
            {labelText}
            <InputBase
                disabled={disabled}
                type={type}
                name={name}
                value={value}
                autoComplete={autoComplete}
                onChange={onChange}
                onBlur={onBlur}
                required={required}
                pattern={pattern}
                autoFocus={autoFocus}
                min={min}
                max={max}
            />
        </Label>
    );
};

Input.defaultProps = {
    type: 'text',
    text: '',
    onChange: noop,
    onBlur: noop,
    value: '',
    pattern: '.*',
    required: true,
    autoComplete: '',
    autoFocus: false,
    disabled: false,
} as Partial<InputProps>;

type SubmitInputProps = {
    value: string;
};

export const SubmitInput = ({value}: SubmitInputProps) => <InputBase type="submit" value={value} />;

SubmitInput.defaultProps = {
    value: 'Submit',
} as Partial<SubmitInputProps>;
