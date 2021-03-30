mixins.push({
    data: {

        newArea: {
            disabled: false,
            fields: {
                Descricao: {
                    error: false,
                    messages: [],
                    value: '',
                },
            },
        },

        editArea: {
            disabled: false,
            fields: {
                D001_AreasID: {
                    value: '',
                },
                DescricaoOriginal: {
                    value: '',
                },
                Descricao: {
                    error: false,
                    messages: [],
                    value: '',
                },
            },
        },

        removeArea: {
            disabled: false,
            fields: {
                D001_AreasID: {
                    value: '',
                },
                Descricao: {
                    value: '',
                },
            },
        },

        areasList: {},

    },
    methods: {

        openNewAreaModal: function () {
            App.newArea.disabled = false;
            App.newArea.fields.Descricao.error = false;
            App.newArea.fields.Descricao.messages = [];
            App.newArea.fields.Descricao.value = '';
            $('#modalNewArea').modal('show');
        },

        openEditAreaModal: function (id, openModal) {
            if (typeof openModal == 'undefined') openModal = true;

            if (App.areasList[id]) {
                var data = JSON.parse(JSON.stringify(App.areasList[id]));

                App.editArea.disabled = false;

                App.editArea.fields.D001_AreasID.value = id;

                App.editArea.fields.Descricao.error = false;
                App.editArea.fields.Descricao.messages = [];
                App.editArea.fields.Descricao.value = data.Descricao;
                App.editArea.fields.DescricaoOriginal.value = data.Descricao;

                if (openModal) $('#modalEditArea').modal('show');
            }
        },

        openRemoveAreaModal: function (id) {
            if (App.areasList[id]) {
                var data = JSON.parse(JSON.stringify(App.areasList[id]));

                App.removeArea.disabled = false;
                App.removeArea.fields.D001_AreasID.value = id;
                App.removeArea.fields.Descricao.value = data.Descricao;

                $('#modalRemoveArea').modal('show');
            }
        },

        handleNewArea: function () {
            function callback(response) {
                if (response.form) {
                    for (let field in response.form) {
                        if (App.newArea.fields[field]) {
                            App.newArea.fields[field].error = response.form[field].error;
                            App.newArea.fields[field].messages = response.form[field].messages;
                        }
                    }
                }

                if (response.messages.length) {
                    $.notify({
                        message: response.messages.join('<br>'),
                    }, {
                        type: response.error ? 'danger' : 'success',
                    });
                }

                App.newArea.disabled = false;

                if (!response.error) {
                    App.newArea.fields.Descricao.value = '';
                    $('#modalNewArea').modal('hide');
                    table.ajax.reload();
                }
            }

            App.newArea.fields.Descricao.error = false;
            App.newArea.fields.Descricao.messages = [];
            App.newArea.fields.Descricao.value = App.newArea.fields.Descricao.value.trim();

            var error = false;

            if (App.newArea.fields.Descricao.value === '') {
                error = true;
                App.newArea.fields.Descricao.error = true;
                App.newArea.fields.Descricao.messages.push('Campo obrigatório.');
            }

            if (!error) {
                App.newArea.disabled = true;

                axios.post(`/api/v1/areas`, {
                    Descricao: App.newArea.fields.Descricao.value,
                    Origem: configs.origem,
                })
                    .then(response => {
                        callback(response.data);
                    })
                    .catch(err => {
                        callback(err.response.data);
                    });
            }
        },

        handleEditArea: function () {
            function callback(response) {
                if (response.form) {
                    for (let field in response.form) {
                        if (App.editArea.fields[field]) {
                            App.editArea.fields[field].error = response.form[field].error;
                            App.editArea.fields[field].messages = response.form[field].messages;
                        }
                    }
                }

                if (response.messages.length) {
                    $.notify({
                        message: response.messages.join('<br>'),
                    }, {
                        type: response.error ? 'danger' : 'success',
                    });
                }

                App.editArea.disabled = false;

                if (!response.error) {
                    table.ajax.reload();
                }
            }

            App.editArea.fields.Descricao.error = false;
            App.editArea.fields.Descricao.messages = [];
            App.editArea.fields.Descricao.value = App.editArea.fields.Descricao.value.trim();

            var error = false;

            if (App.editArea.fields.Descricao.value === '') {
                error = true;
                App.editArea.fields.Descricao.error = true;
                App.editArea.fields.Descricao.messages.push('Campo obrigatório.');
            }

            if (!error) {
                App.editArea.disabled = true;

                axios.put(`/api/v1/areas/${App.editArea.fields.D001_AreasID.value}`, {
                    Descricao: App.editArea.fields.Descricao.value,
                })
                    .then(response => {
                        callback(response.data);
                    })
                    .catch(err => {
                        callback(err.response.data);
                    });
            }
        },

        handleRemoveArea: function () {
            App.removeArea.disabled = true;

            axios.delete(`/api/v1/areas/${App.removeArea.fields.D001_AreasID.value}`)
                .then(response => {
                    $.notify({
                        message: 'Área removida com sucesso.',
                    }, {
                        type: 'success',
                    });
                })
                .catch(err => {
                    $.notify({
                        message: 'Houve um erro ao remover a área. Por favor, tente novamente.',
                    }, {
                        type: 'danger',
                    });
                })
                .finally(() => {
                    $('#modalRemoveArea').modal('hide');
                    App.removeArea.disabled = false;
                    table.ajax.reload();
                });
        },

    },
});

var table = null;

$(function () {

    table = $('#tableAreas')
        .DataTable({
            language: {
                url: '/v1/lib/Portuguese-Brasil.json',
            },
            processing: true,
            serverSide: true,
            ajax: `/api/v1/areas?origem=${configs.origem}`,
            columns: [
                { data: 'D001_AreasID' },
                { data: 'OrigemNome' },
                { data: 'Descricao' },
                {
                    data: 'Created_at',
                    mRender: function (data, type, row) {
                        data = data.split(' ');
                        data[0] = data[0].split('-').reverse().join('/');
                        data = data.join(' ');
                        return data;
                    },
                },
                {
                    mRender: function (data, type, row) {
                        return `
                            <button class="btn btn-xs btn-default datatable-action-edit" data-id="${row.D001_AreasID}">
                                <span class="fa fa-pencil"></span>
                            </button>

                            <button class="btn btn-xs btn-default datatable-action-remove" data-id="${row.D001_AreasID}">
                                <span class="fa fa-trash"></span>
                            </button>
                        `;
                    },
                },
            ],
            order: [[2, 'asc']],
            columnDefs: [
                {
                    targets: 0,
                    className: 'text-right',
                },
                {
                    targets: 4,
                    orderable: false,
                },
            ],
            createdRow: function (row, data, dataIndex) {
                App.areasList[data.D001_AreasID] = data;
                // if (data.Status == 0) {
                //     $(row).addClass('bg-danger');
                // }
            },
        })
        .on('draw.dt', function () {

            $('.datatable-action-edit').off('click').on('click', function (e) {
                var id = $(this).attr('data-id');
                App.openEditAreaModal(id);
            });

            $('.datatable-action-remove').off('click').on('click', function (e) {
                var id = $(this).attr('data-id');
                App.openRemoveAreaModal(id);
            });

        });

});
