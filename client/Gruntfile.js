module.exports = function(grunt) {
    grunt.loadTasks('node_modules/grunt-ng-annotate/tasks');
    grunt.loadTasks('node_modules/grunt-contrib-uglify/tasks');
    grunt.loadTasks('node_modules/grunt-sass/tasks');
    grunt.loadTasks('node_modules/grunt-contrib-cssmin/tasks');
    grunt.registerTask('default',['ngAnnotate', 'uglify', 'sass', 'cssmin']);

    grunt.initConfig({
        ngAnnotate: {
            options: {
                singleQuotes: true,
            },
            jsFiles: {
                files: {
                    'app.concat.js': [
                        'node_modules/angular-i18n/angular-locale_pt-br.js'
                        , 'node_modules/angular-route/angular-route.min.js'
                        , 'node_modules/ngstorage/ngStorage.min.js'
                        , 'node_modules/angular-ui-bootstrap/dist/ui-bootstrap.min.js'
                        , 'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js'
                        , 'node_modules/angular-filter/dist/angular-filter.min.js'
                        , 'node_modules/angular-sanitize/angular-sanitize.min.js'
                        , 'node_modules/angular-animate/angular-animate.min.js'
                        , 'node_modules/chart.js/dist/Chart.min.js'
                        , 'node_modules/angular-chart.js/dist/angular-chart.min.js'
                        , 'node_modules/ng-file-upload/dist/ng-file-upload-shim.min.js'
                        , 'node_modules/ng-file-upload/dist/ng-file-upload.min.js'
                        , 'node_modules/sortablejs/Sortable.min.js'
                        , 'node_modules/sortablejs/ng-sortable.js'
                        , 'partials/*/*.js'
                        , 'filters/*.js'
                        , 'services/*.js'
                        , 'services/*/*.js'
                        , 'controllers/*.js'
                        , 'directives/*/*.js'
                    ]
                },
            }
        },
        uglify: {
            jsFiles: {
                files: {
                    'app.min.js': ['app.concat.js']
                }
            }
        },
        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    './stylesheets/main.css': './stylesheets/main.scss'
                }
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'app.min.css': [
                        './assets/css/bootstrap-24grid-violet/css/bootstrap.min.css'
                        , './node_modules/angular-chart.js/dist/angular-chart.css'
                        , './stylesheets/main.css'
                    ]
                }
            }
        }
    });
    
};


