class Sql {
    constructor(connection) {
        this.connection = connection;
    }

    getAll(query, args = []) {
        return this.connection.raw(query, args)
            .then(data => data[0].map(row => {
                return JSON.parse(JSON.stringify(row));
            }));
    }

    getOne(query, args = []) {
        return this.getAll(query, args)
            .then(data => data[0] || false);
    }

    insert(query, args) {
        return this.connection.raw(query, args)
            .then(data => data[0].insertId);
    }

    update(query, args) {
        return this.connection.raw(query, args)
            .then(data => data[0].affectedRows);
    }

    // close(cb) {
    //     knex.destroy(cb);
    // }

    generateOptions(queryString) {
        const search = queryString.search || { value: '' };
        const searchValue = (search.value || '').trim();

        const columns = queryString.columns || [];
        const order = queryString.order || [{ column: '0', dir: 'asc' }];
        const firstOrder = order[0] || { column: '0', dir: 'asc' };
        const orderField = columns[firstOrder.column] ? [columns[firstOrder.column].data, firstOrder.dir] : null;

        let orderBy = null;
        if (orderField) orderBy = `ORDER BY ${orderField.join(' ')}`;

        const start = queryString.start || null;
        const length = queryString.length || null;

        let limit = null;
        if (length) {
            if (start) limit = `LIMIT ${start}, ${length}`;
            else limit = `LIMIT ${length}`;
        }

        return {
            searchValue,
            orderBy,
            limit,
        };
    }
}

module.exports = Sql;
