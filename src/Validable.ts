interface Validable {
    validate(): boolean | never;
}

export default Validable;
