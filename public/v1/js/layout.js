$.notifyDefaults({
    animate: {
        enter: 'animated fadeInDown',
        exit: 'animated fadeOutUp',
    },
});

var App = new Vue({
    el: '#AppVue',
    data: {
        configs: configs,
        configsNewProject: null,
    },
    methods: {

        openProjectModal: function () {
            App.configsNewProject = Number(App.configs.origem);
            $('#modalProject').modal();
        },

        changeProject: function () {
            const configsNewProject = Number(App.configsNewProject);

            if (configsNewProject) {
                axios.put('/admin/v1/configs', {
                    origem: configsNewProject,
                })
                    .then(response => {
                        console.log('axios then response.data', response.data);

                        $.notify({
                            message: 'Projeto alterado com sucesso! Atualizando página em alguns segundos.',
                        }, {
                            type: 'success',
                        });

                        setTimeout(function () {
                            window.location.reload();
                        }, 2000);
                    })
                    .catch(error => {
                        console.log('axios catch error.response.data', error.response.data);

                        $.notify({
                            message: 'Ocorreu um erro. Tente novamente.',
                        }, {
                            type: 'danger',
                        });
                    })
                    .finally(() => {
                        $('#modalProject').modal('hide');
                    })
                    ;
            }
        },

    },
    mixins,
});

if (App.init) App.init();

// App.openProjectModal();

// setTimeout(function () {
//     App.changeProject();
// }, 1000);