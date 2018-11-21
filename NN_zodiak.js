//pokazywanie zodiaku dla nerthusa
try
{

nerthus.zodiac = {}
nerthus.zodiac.id = 12

nerthus.zodiac.signs = [
    "",
    "Wodnik",
    "Ryby",
    "Baran",
    "Byk",
    "Bliźnięta",
    "Rak",
    "Lew",
    "Panna",
    "Waga",
    "Skorpion",
    "Strzelec",
    "Koziorożec"
]

nerthus.zodiac.calculate = function()
{
    let makeStartDate = function(day,month)
    {
        let date = new Date()
        date.setUTCDate(day)
        date.setUTCMonth(month - 1)
        return date
    }
    const date = new Date()
    const SIGNS =
        [
            makeStartDate(20, 1), // Wodnik
            makeStartDate(18, 2), // Ryby
            makeStartDate(20, 3), // Baran
            makeStartDate(20, 4), // Byk
            makeStartDate(21, 5), // Bliźnięta
            makeStartDate(21, 6), // Rak
            makeStartDate(22, 7), // Lew
            makeStartDate(23, 8), // Panna
            makeStartDate(23, 9), // Waga
            makeStartDate(23, 10),// Skorpion
            makeStartDate(22, 11),// Strzelec
            makeStartDate(21, 12) // Koziorożec
        ]
    let currentSign = 12
    SIGNS.forEach(function(SIGN, i) {
        if(date >= SIGN)
            currentSign = (i + 1) //element index + 1
    })
    return currentSign
}

nerthus.zodiac.set_zodiac = function (id)
{
    id = parseInt(id) || -1
    if (0 > id || id > 12)
        id = this.calculate()
    this.id = id
    $('#nZodiac').css('background', 'url(' + nerthus.graf.zodiac + ') -' + (this.id - 1) * 55 + 'px -' + (this.id - 1) * 55 + 'px')
}

nerthus.zodiac.set_global_zodiac = function ()
{
    let zodiacId = this.calculate().zodiac
    this.set_zodiac(zodiacId)
    this.start_change_timer()
}

nerthus.zodiac.run = function ()
{
    //ikonka zodiaku
    $('<div id="nZodiac" style="z-Index:300; height:55px; width: 55px; opacity: 0.8; position: absolute; top: 55px; left: 0px; cursor: pointer"></div>').appendTo('#centerbox2')
        .mouseenter(function () {
            $("#nZodiacDesc").fadeIn(500).html(this.descriptions[this.id][0])
        }.bind(this))
        .mouseleave(function () {
            $("#nZodiacDesc").fadeOut(500)
        })
        .click(function () {
            if ($("#nZodiacDesc").html() === nerthus.zodiac.descriptions[nerthus.zodiac.id][0])
                $("#nZodiacDesc").fadeIn(500).html(nerthus.zodiac.descriptions[nerthus.zodiac.id][1])
            else
                $("#nZodiacDesc").fadeIn(500).html(nerthus.zodiac.descriptions[nerthus.zodiac.id][0])
        });
    //pole opisowe zodiaku
    $('<div id="nZodiacDesc" style="z-Index:300; width: 410px; opacity: 0.8; position: absolute; top: 60px; left: 60px; font: bold 14px Georgia; color:#F0F8FF"></div>').appendTo('#centerbox2');

    nerthus.zodiac.set_zodiac()
}

nerthus.zodiac.start_change_timer = function ()
{
    let hour = (Math.floor((new Date().getUTCHours()) / 4) + 1) * 24
    let date = new Date()
    date.setUTCHours(hour, 0, 0)
    let interval = date - new Date()
    this.change_timer = setTimeout(this.set_global_zodiac.bind(this), interval)
}

nerthus.zodiac.descriptions =
    [
        [],//0
        [  //1.  [Wodnik]
            "Wodnik - Wynalazczość, niezależność oraz przekraczanie granic pozwalają zasmakować umiejętności, które dotychczas były niedostępne, aż do zatracenia.",
            "Szkoła z najwyższym poziomem zostaje zablokowana. Najsłabsza szkoła uzyskuje jej poziom. Brak efektu w przypadku szkół o równym poziomie bądź braku jednej, najsilniejszej szkoły."
        ],

        [  //2.  [Ryby]
            "Ryby - Ucieczka od rzeczywistości w iluzje, które stają się sztuką, znacząco wzmacniają możliwości maga. Jednakże złożoność wyobrażeń uniemożliwia kooperację z innymi.",
            "Podstawowe iluzje nie zużywają energii. Zablokowane korzystanie z atrybutu teoria magiczna."
        ],

        [  //3.  [Baran]
            "Baran - Czerpanie mocy z czystej agresji wprawdzie wzmacnia magię ofensywną lecz destabilizuje pozostałe szkoły. Tworzenie portali staje się zbyt niebezpieczne.",
            "Podstawowe zaklęcia zniszczenia nie wymagają energii maga, jednak przemiana jest zupełnie zablokowana."
        ],

        [  //4.  [Byk]
            "Byk - Stałość, rzeczowość i skupienie ułatwiają snucie wysoce skomplikowanych czarów.",
            "Do tworzenia magazynów energii potrzebny jest dowolny poziom zaklinania. Ich siła jest zależna od posiadanego poziomu."
        ],

        [  //5.  [Bliźnięta]
            "Bliźnięta - Wszechstronna wiedza, obiektywizm i niezakłócona emocjami racjonalność, pozwalają skuteczniej przeciwstawiać się sile innych magów.",
            "Odrzucenie wzrasta o jeden poziom (arcymistrz zyskuje możliwość spętania mocy innego arcymistrza)."
        ],

        [  //6.  [Rak]
            "Rak - Instynkt i ciekawość sprzyjają zgłębianiu myśli innych oraz mechanik świata. Skupienie się na sprawach odległych naraża maga na niebezpieczeństwa.",
            "Myśli innych można czytać na poziomie mistrzowskim poznania. W zamian zablokowane jest odrzucenie."
        ],

        [  //7.  [Lew]
            "Lew - Stanowczość i autorytet pozwalają działać na wielką skalę, jednakże towarzysząca temu duma sprawia, iż przedsięwzięcia te są nieco przyziemne.",
            "Najsłabsza szkoła zostaje wzmocniona o jeden poziom, jednak możliwe jest korzystanie wyłącznie z elementów niższych. Brak efektu, jeżeli mag takowych nie posiada."
        ],

        [  //8.  [Panna]
            "Panna - Czysta wręcz troska oraz pedantyczność stanowią idealną podstawę do pomocy zagrożonym życiom.",
            "Darmowe przywrócenie 3/5 jednego organizmu żywego dziennie. W zamian zablokowane jest zniszczenie."
        ],

        [  //9.  [Waga]
            "Waga - Ułatwione jest wyważenie zaklęć z użyciem ich pierwotnej mocy, która zostaje ustabilizowana.",
            "Zaklęcia na poziomie adepta przemiany nie wymagają energii, jednak zablokowane jest użycie elementów niższych."
        ],

        [  //10. [Skorpion]
            "Skorpion - Ewokacja pozwala z łatwością sięgnąć po istoty, które dotychczas znajdowały się na granicy możliwości maga. Zgłębienie ich tajemnic ma jednak swój koszt.",
            "Przywołanie zwiększone jest o jeden poziom, ale mag może przyzwać o połowę stworzeń mniej. Zablokowane zostają elementy natury i równowagi."
        ],

        [  //11. [Strzelec]
            "Strzelec -  Entuzjazm, otwartość oraz szczerość znacząco ułatwiają współpracę z innymi.",
            "Umożliwia współpracę z magami posługującymi się innymi szkołami. Jeżeli posiadany jest już atrybut teoria magiczna, to podczas kooperacji zaklęcie maga z kosmosem wzrasta o jeden stopień."
        ],

        [  //12. [Koziorożec]
            "Koziorożec - Wytrwałe, zdyscyplinowane oraz ambitne dążenie do celu wprost prowadzą do czystego profesjonalizmu.",
            "Najlepiej rozwinięta szkoła, (inna niż w stopniu arcymistrzowskim) podniesiona zostaje o jeden poziom. W zamian reszta szkół spada o jeden poziom (lub w przypadku poziomu 1/5 zostaje zablokowana) Powyższe nie ma zastosowania, gdy nie ma jednej szkoły na poziomie wyższym niż inne. Podniesienie poziomu nie przekracza stopnia 5/5."
        ]

    ];

nerthus.zodiac.start = function ()
{
    if (nerthus.options['zodiac'])
        nerthus.defer(this.run.bind(this))
}

nerthus.zodiac.start()

} catch (e) {log('NerthusZodiac Error: ' + e.message, 1)}

