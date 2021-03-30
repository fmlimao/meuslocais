mixins.push({
    data: {

        newSubarea: {
            disabled: false,
            fields: {
                D001_AreasID: {
                    error: false,
                    messages: [],
                    value: '',
                },
                Descricao: {
                    error: false,
                    messages: [],
                    value: '',
                },
            },
        },

        editSubarea: {
            disabled: false,
            fields: {
                D001_SubareasID: {
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

        removeSubarea: {
            disabled: false,
            fields: {
                D001_SubareasID: {
                    value: '',
                },
                Descricao: {
                    value: '',
                },
            },
        },

        subareasList: {},

        areasList: [],

    },
    methods: {

        openNewSubareaModal: function () {
            App.getAllAreas(function () {
                App.newSubarea.disabled = false;

                App.newSubarea.fields.D001_AreasID.error = false;
                App.newSubarea.fields.D001_AreasID.messages = [];
                App.newSubarea.fields.D001_AreasID.value = '';

                App.newSubarea.fields.Descricao.error = false;
                App.newSubarea.fields.Descricao.messages = [];
                App.newSubarea.fields.Descricao.value = '';

                $('#modalNewSubarea').modal('show');
            });
        },

        openEditSubareaModal: function (id) {
            if (App.subareasList[id]) {
                var data = JSON.parse(JSON.stringify(App.subareasList[id]));

                App.editSubarea.disabled = false;

                App.editSubarea.fields.D001_SubareasID.value = id;

                App.editSubarea.fields.Descricao.error = false;
                App.editSubarea.fields.Descricao.messages = [];
                App.editSubarea.fields.Descricao.value = data.Subarea;
                App.editSubarea.fields.DescricaoOriginal.value = data.Subarea;

                $('#modalEditSubarea').modal('show');
            }
        },

        openRemoveSubareaModal: function (id) {
            if (App.subareasList[id]) {
                var data = JSON.parse(JSON.stringify(App.subareasList[id]));
                console.log('data', data);

                App.removeSubarea.disabled = false;
                App.removeSubarea.fields.D001_SubareasID.value = id;
                App.removeSubarea.fields.Descricao.value = data.Subarea;

                $('#modalRemoveSubarea').modal('show');
            }
        },

        handleNewSubarea: function () {
            function callback(response) {
                if (response.form) {
                    for (let field in response.form) {
                        if (App.newSubarea.fields[field]) {
                            App.newSubarea.fields[field].error = response.form[field].error;
                            App.newSubarea.fields[field].messages = response.form[field].messages;
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

                App.newSubarea.disabled = false;

                if (!response.error) {
                    App.newSubarea.fields.Descricao.value = '';
                    $('#modalNewSubarea').modal('hide');
                    table.ajax.reload();
                }
            }

            App.newSubarea.fields.D001_AreasID.error = false;
            App.newSubarea.fields.D001_AreasID.messages = [];
            App.newSubarea.fields.D001_AreasID.value = String(App.newSubarea.fields.D001_AreasID.value).trim();

            App.newSubarea.fields.Descricao.error = false;
            App.newSubarea.fields.Descricao.messages = [];
            App.newSubarea.fields.Descricao.value = String(App.newSubarea.fields.Descricao.value).trim();

            var error = false;

            if (App.newSubarea.fields.D001_AreasID.value === '') {
                error = true;
                App.newSubarea.fields.D001_AreasID.error = true;
                App.newSubarea.fields.D001_AreasID.messages.push('Campo obrigatório.');
            }

            if (App.newSubarea.fields.Descricao.value === '') {
                error = true;
                App.newSubarea.fields.Descricao.error = true;
                App.newSubarea.fields.Descricao.messages.push('Campo obrigatório.');
            }

            if (!error) {
                App.newSubarea.disabled = true;

                axios.post(`/api/v1/subareas`, {
                    D001_AreasID: App.newSubarea.fields.D001_AreasID.value,
                    Descricao: App.newSubarea.fields.Descricao.value,
                })
                    .then(response => {
                        callback(response.data);
                    })
                    .catch(err => {
                        callback(err.response.data);
                    });
            }
        },

        handleEditSubarea: function () {
            function callback(response) {
                if (response.form) {
                    for (let field in response.form) {
                        if (App.editSubarea.fields[field]) {
                            App.editSubarea.fields[field].error = response.form[field].error;
                            App.editSubarea.fields[field].messages = response.form[field].messages;
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

                App.editSubarea.disabled = false;

                if (!response.error) {
                    table.ajax.reload();
                }
            }

            App.editSubarea.fields.Descricao.error = false;
            App.editSubarea.fields.Descricao.messages = [];
            App.editSubarea.fields.Descricao.value = App.editSubarea.fields.Descricao.value.trim();

            var error = false;

            if (App.editSubarea.fields.Descricao.value === '') {
                error = true;
                App.editSubarea.fields.Descricao.error = true;
                App.editSubarea.fields.Descricao.messages.push('Campo obrigatório.');
            }

            if (!error) {
                App.editSubarea.disabled = true;

                axios.put(`/api/v1/subareas/${App.editSubarea.fields.D001_SubareasID.value}`, {
                    Descricao: App.editSubarea.fields.Descricao.value,
                })
                    .then(response => {
                        callback(response.data);
                    })
                    .catch(err => {
                        callback(err.response.data);
                    });
            }
        },

        handleRemoveSubarea: function () {
            App.removeSubarea.disabled = true;

            axios.delete(`/api/v1/subareas/${App.removeSubarea.fields.D001_SubareasID.value}`)
                .then(response => {
                    $.notify({
                        message: 'Subárea removida com sucesso.',
                    }, {
                        type: 'success',
                    });
                })
                .catch(err => {
                    $.notify({
                        message: 'Houve um erro ao remover a subárea. Por favor, tente novamente.',
                    }, {
                        type: 'danger',
                    });
                })
                .finally(() => {
                    $('#modalRemoveSubarea').modal('hide');
                    App.removeSubarea.disabled = false;
                    table.ajax.reload();
                });
        },

        getAllAreas: function (callback) {
            callback = callback || function () { };

            function ajaxCallback(response) {
                if (response.error) {
                    $.notify({
                        message: 'Houve um erro ao buscar as área. Por favor, tente novamente.',
                    }, {
                        type: 'danger',
                    });

                    return;
                }

                App.areasList = [];

                for (let i in response.content.areas) {
                    App.areasList.push(response.content.areas[i]);
                }

                callback();
            }

            axios.get(`/api/v1/areas?origem=${configs.origem}`)
                .then(response => {
                    ajaxCallback(response.data);
                })
                .catch(err => {
                    ajaxCallback(err.response.data);
                });
        },

    },
});

var table = null;

$(function () {

    table = $('#tableSubareas')
        .DataTable({
            language: {
                url: '/v1/lib/Portuguese-Brasil.json',
            },
            processing: true,
            serverSide: true,
            ajax: `/api/v1/subareas?origem=${configs.origem}`,
            columns: [
                { data: 'D001_SubareasID' },
                { data: 'OrigemNome' },
                { data: 'Area' },
                { data: 'Subarea' },
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
                            <button class="btn btn-xs btn-default datatable-action-edit" data-id="${row.D001_SubareasID}">
                                <span class="fa fa-pencil"></span>
                            </button>

                            <button class="btn btn-xs btn-default datatable-action-remove" data-id="${row.D001_SubareasID}">
                                <span class="fa fa-trash"></span>
                            </button>
                        `;
                    },
                },
            ],
            order: [[0, 'asc']],
            columnDefs: [
                {
                    targets: 0,
                    className: 'text-right',
                },
                {
                    targets: 5,
                    orderable: false,
                },
            ],
            createdRow: function (row, data, dataIndex) {
                App.subareasList[data.D001_SubareasID] = data;
                // if (data.Status == 0) {
                //     $(row).addClass('bg-danger');
                // }
            },
        })
        .on('draw.dt', function () {

            $('.datatable-action-edit').off('click').on('click', function (e) {
                var id = $(this).attr('data-id');
                App.openEditSubareaModal(id);
            });

            $('.datatable-action-remove').off('click').on('click', function (e) {
                var id = $(this).attr('data-id');
                App.openRemoveSubareaModal(id);
            });

        });

});
