(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();


    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
        return false;
    });


    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });


    // Progress Bar
    $('.pg-bar').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, { offset: '80%' });


    // Calender
    $('#calender').datetimepicker({
        inline: true,
        format: 'L'
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: true,
        loop: true,
        nav: false
    });


    // Chart Global Color
    Chart.defaults.color = "#6C7293";
    Chart.defaults.borderColor = "#000000";


    // Worldwide Sales Chart
    function onlineAndCODRevenue() {

        $.ajax({
            url: '/admin/totalRevenue',
            a: console.log("hhhh"),
            mehtode: 'get',
            success: (response) => {
                console.log(response)
                var ctx2 = $("#salse-revenue").get(0).getContext("2d");
                let date = []
                if (response.COD.length > 6) {
                    var today = 6
                } else {
                    var today = response.COD.length
                }
                for (let i = 0; i < today; i++) {
                    date.push(response.COD[i]._id.day + '/' + response.COD[i]._id.month + '/' + response.COD[i]._id.year)
                }
                var myChart2 = new Chart(ctx2, {
                    type: "line",
                    data: {
                        // labels: [ response.COD[0]._id.day+"/"+response.COD[0]._id.month+'/'+response.COD[0]._id.year,
                        // response.COD[1]._id.day+"/"+response.COD[1]._id.month+'/'+response.COD[1]._id.year,
                        // response.COD[2]._id.day+"/"+response.COD[2]._id.month+'/'+response.COD[2]._id.year],
                        labels: date,
                        datasets: [{
                            label: "COD",
                            data: [response.COD[0].totalsum, response.COD[1].totalsum, response.COD[2].totalsum, response.COD[3].totalsum, response.COD[4].totalsum, response.COD[5].totalsum,],
                            backgroundColor: "rgba(235, 22, 22, .7)",
                            fill: true
                        },
                        {
                            label: "Online",
                            data: [response.ONLINE[0].totalOnlineSum, response.ONLINE[1].totalOnlineSum, response.ONLINE[2].totalOnlineSum, response.ONLINE[3].totalOnlineSum, response.ONLINE[4].totalOnlineSum, response.ONLINE[5].totalOnlineSum,],
                            backgroundColor: "yellow",
                            fill: true
                        }
                        ]
                    },
                    options: {
                        responsive: true
                    }
                });

            }
        })
    }
    onlineAndCODRevenue()
    // Single Line Chart
    function totalRevenue() {
        $.ajax({
            url: '/admin/revenue',
            method: 'get',
            success: (response) => {
                console.log(response,"lasr")
                var ctx3 = $("#line-chart").get(0).getContext("2d");
                let date = []
                if (response.length > 6) {
                    var today = 6
                } else {
                    var today = response.length
                }
                for (let i = 0; i < today; i++) {
                    date.push(response[i]._id.day + '/' + response[i]._id.month + '/' + response[i]._id.year)
                }
                var myChart3 = new Chart(ctx3, {
                    type: "line",
                    data: {
                        labels: date,
                        datasets: [{
                            label: "Salse",
                            fill: false,
                            backgroundColor: "rgba(235, 22, 22, .7)",
                            data: [response[0].totalsum,response[1].totalsum,response[2].totalsum,response[3].totalsum,response[4].totalsum,response[5].totalsum,response[6].totalsum,]
                        }]
                    },
                    options: {
                        responsive: true
                    }
                });

            }
        })
    }totalRevenue()


    var ctx1 = $("#worldwide-sales").get(0).getContext("2d");
    var myChart1 = new Chart(ctx1, {
        type: "bar",
        data: {
            labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"],
            datasets: [{
                label: "USA",
                data: [15, 30, 55, 65, 60, 80, 95],
                backgroundColor: "rgba(235, 22, 22, .7)"
            },
            {
                label: "UK",
                data: [8, 35, 40, 60, 70, 55, 75],
                backgroundColor: "rgba(235, 22, 22, .5)"
            },
            {
                label: "AU",
                data: [12, 25, 45, 55, 65, 70, 60],
                backgroundColor: "rgba(235, 22, 22, .3)"
            }
            ]
        },
        options: {
            responsive: true
        }
    });


    // Salse & Revenue Chart








    // Single Line Chart
    var ctx3 = $("#line-chart").get(0).getContext("2d");
    var myChart3 = new Chart(ctx3, {
        type: "line",
        data: {
            labels: [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
            datasets: [{
                label: "Salse",
                fill: false,
                backgroundColor: "rgba(235, 22, 22, .7)",
                data: [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15]
            }]
        },
        options: {
            responsive: true
        }
    });


    // Single Bar Chart
    var ctx4 = $("#bar-chart").get(0).getContext("2d");
    var myChart4 = new Chart(ctx4, {
        type: "bar",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(235, 22, 22, .7)",
                    "rgba(235, 22, 22, .6)",
                    "rgba(235, 22, 22, .5)",
                    "rgba(235, 22, 22, .4)",
                    "rgba(235, 22, 22, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: {
            responsive: true
        }
    });


    // Pie Chart
    var ctx5 = $("#pie-chart").get(0).getContext("2d");
    var myChart5 = new Chart(ctx5, {
        type: "pie",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(235, 22, 22, .7)",
                    "rgba(235, 22, 22, .6)",
                    "rgba(235, 22, 22, .5)",
                    "rgba(235, 22, 22, .4)",
                    "rgba(235, 22, 22, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: {
            responsive: true
        }
    });


    // Doughnut Chart
    var ctx6 = $("#").get(0).getContext("2d");
    var myChart6 = new Chart(ctx6, {
        type: "doughnut",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(235, 22, 22, .7)",
                    "rgba(235, 22, 22, .6)",
                    "rgba(235, 22, 22, .5)",
                    "rgba(235, 22, 22, .4)",
                    "rgba(235, 22, 22, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: {
            responsive: true
        }
    });


})
    (jQuery);

