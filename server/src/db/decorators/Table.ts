function Table(name: string): any {
    return (target: any): any => {
        target.__table_name__ = name;
        return target;
    };
}

export { Table };