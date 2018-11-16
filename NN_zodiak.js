//pokazywanie zodiaku dla nerthusa
try
{

nerthus.zodiac = {}
nerthus.zodiac.calculate = function ()
{
    //zmienne do maszynki obliczającej
    const date = new Date()
    const day = date.getUTCDate()
    const month = date.getUTCMonth() + 1

    let zodiac = month - 1
    switch (month) //zmiana znaków w innych miesiącach
    {
        case 1:
            if (day < 20)
                zodiac = 12
            break;
        case 2:
            if (day < 18)
                zodiac--
            break;
        case 3:
        case 4:
            if (day < 20)
                zodiac--
            break;
        case 5:
        case 6:
        case 12:
            if (day < 21)
                zodiac--
            break;
        case 7:
        case 11:
            if (day < 22)
                zodiac--
            break;
        case 8:
        case 9:
        case 10:
            if (day < 23)
                zodiac--
            break;
    }

    return zodiac
}

nerthus.zodiac.spot = {}
nerthus.zodiac.spot.toId = function (spot)
{
    return (spot.x * 7 + spot.y) % 21
}

nerthus.zodiac.spot.fromId = function (id)
{
    return {x: Math.floor(id / 7), y: id % 7}
}

nerthus.zodiac.set_zodiac = function (id)
{
    id = parseInt(id) || -1
    if (0 > id || id > 12)
        id = this.calculate()
    this.id = id
    let spot = nerthus.zodiac.spot.fromId(id)
    $('#nZodiac').css('background', 'url(' + nerthus.graf.zodiac + ') -' + spot.x * 55 + 'px -' + spot.y * 55 + 'px')
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
            $("#nZodiacDesc").fadeOut(500);
        })
        .click(function () {
            if ($("#nZodiacDesc").html() === nerthus.zodiac.descriptions[nerthus.weather.id][0])
                $("#nZodiacDesc").fadeIn(500).html(nerthus.zodiac.descriptions[nerthus.weather.id][1]);
            else
                $("#nZodiacDesc").fadeIn(500).html(nerthus.zodiac.descriptions[nerthus.weather.id][0]);
        });
    //pole opisowe zodiaku
    $('<div id="nZodiacDesc" style="z-Index:300; width: 410px; opacity: 0.8; position: absolute; top: 60px; left: 60px; font: bold 14px Georgia; color:#F0F8FF"></div>').appendTo('#centerbox2');

    nerthus.zodiac.set_zodiac()
}

nerthus.zodiac.start_change_timer = function ()
{
    var hour = (Math.floor((new Date().getUTCHours()) / 4) + 1) * 24
    var date = new Date()
    date.setUTCHours(hour)
    date.setUTCMinutes(0)
    date.setUTCSeconds(0)
    var interval = date - new Date()
    this.change_timer = setTimeout(this.set_global_zodiac.bind(this), interval)
}

nerthus.zodiac.descriptions =
    [
        [ //1. [Wodnik]
            "Wodnik - Wynalazczość, niezależność oraz przekraczanie granic pozwalają zasmakować umiejętności, które dotychczas były niedostępne, aż do zatracenia.",
            "Szkoła z najwyższym poziomem zostaje zablokowana. Najsłabsza szkoła uzyskuje jej poziom. Brak efektu w przypadku szkół o równym poziomie bądź braku jednej, najsilniejszej szkoły."
        ],

        [ //2. [Ryby]
            "Ryby - Ucieczka od rzeczywistości w iluzje, które stają się sztuką, znacząco wzmacniają możliwości maga. Jednakże złożoność wyobrażeń uniemożliwia kooperację z innymi.",
            "Podstawowe iluzje nie zużywają energii. Zablokowane korzystanie z atrybutu teoria magiczna."
        ],

        [ //3. [Baran]
            "Baran - Czerpanie mocy z czystej agresji wprawdzie wzmacnia magię ofensywną lecz destabilizuje pozostałe szkoły. Tworzenie portali staje się zbyt niebezpieczne.",
            "Podstawowe zaklęcia zniszczenia nie wymagają energii maga, jednak przemiana jest zupełnie zablokowana."
        ],

        [ //4. [Byk]
            "Byk - Stałość, rzeczowość i skupienie ułatwiają snucie wysoce skomplikowanych czarów.",
            "Do tworzenia magazynów energii potrzebny jest dowolny poziom zaklinania. Ich siła jest zależna od posiadanego poziomu."
        ],

        [ //5. [Bliźnięta]
            "Bliźnięta - Wszechstronna wiedza, obiektywizm i niezakłócona emocjami racjonalność, pozwalają skuteczniej przeciwstawiać się sile innych magów.",
            "Odrzucenie wzrasta o jeden poziom (arcymistrz zyskuje możliwość spętania mocy innego arcymistrza)."
        ],

        [ //6. [Rak]
            "Rak - Instynkt i ciekawość sprzyjają zgłębianiu myśli innych oraz mechanik świata. Skupienie się na sprawach odległych naraża maga na niebezpieczeństwa.",
            "Myśli innych można czytać na poziomie mistrzowskim poznania. W zamian zablokowane jest odrzucenie."
        ],

        [ //7. [Lew]
            "Lew - Stanowczość i autorytet pozwalają działać na wielką skalę, jednakże towarzysząca temu duma sprawia, iż przedsięwzięcia te są nieco przyziemne.",
            "Najsłabsza szkoła zostaje wzmocniona o jeden poziom, jednak możliwe jest korzystanie wyłącznie z elementów niższych. Brak efektu, jeżeli mag takowych nie posiada."
        ],

        [ //8. [Panna]
            "Panna - Czysta wręcz troska oraz pedantyczność stanowią idealną podstawę do pomocy zagrożonym życiom.",
            "Darmowe przywrócenie 3/5 jednego organizmu żywego dziennie. W zamian zablokowane jest zniszczenie."
        ],

        [ //9. [Waga]
            "Waga - Ułatwione jest wyważenie zaklęć z użyciem ich pierwotnej mocy, która zostaje ustabilizowana.",
            "Zaklęcia na poziomie adepta przemiany nie wymagają energii, jednak zablokowane jest użycie elementów niższych."
        ],

        [ //10. [Skorpion]
            "Skorpion - Ewokacja pozwala z łatwością sięgnąć po istoty, które dotychczas znajdowały się na granicy możliwości maga. Zgłębienie ich tajemnic ma jednak swój koszt.",
            "Przywołanie zwiększone jest o jeden poziom, ale mag może przyzwać o połowę stworzeń mniej. Zablokowane zostają elementy natury i równowagi."
        ],

        [ //11. [Strzelec]
            "Strzelec -  Entuzjazm, otwartość oraz szczerość znacząco ułatwiają współpracę z innymi.",
            "Umożliwia współpracę z magami posługującymi się innymi szkołami. Jeżeli posiadany jest już atrybut teoria magiczna, to podczas kooperacji zaklęcie maga z kosmosem wzrasta o jeden stopień."
        ],

        [ //12. [Koziorożec]
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

