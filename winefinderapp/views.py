from django.http import JsonResponse
from django.shortcuts import render
from django.shortcuts import render
# Create your views here.
from winefinderapp.wine_finder_api.filter.filter_content_based import WineRecommender
import json
import  pandas as pd


def index(request):
    return render(request, 'winefinderapp/index.html')


def get_wine_search(request):
    name = request.GET.get('name')
    df_wine = WineRecommender.search(name)
    new_list = []
    try:
        json_records = df_wine.to_json(orient='records')
        list = json.loads(json_records)
        for index, data in enumerate(list):
            info = {
                "id": (index + 1),
                "name": data["WineName"],
                "title": "Primitivo di Manduria 2015",
                "thumb": data["ImageLink"],
                "detail": data["ImageLink"],
                "grade": data["AvgScore"],
                "ratings": data["ScoreCount"],
                "percent": 0,
                "flag": {
                    "icon": "italy",
                    "text": "Sicily, Italy"
                },
                "tags": [
                    {"icon": "italy", "text": "Italy"},
                    {"text": "Brunello di Montalcino"},
                    {"text": "Banfi"},
                    {"text": "Red wine"},
                    {"text": "Sangiovese"}
                ],
                "range": [data["Light"], data["Smooth"], data["Dry"], data["Soft"]]
            }
            new_list.append(info)
    except:
        pass


    dict = {
        "lists": new_list
    }
    return JsonResponse(dict)


def get_wine_top(request):
    df_top_wine = WineRecommender.top(30)
    json_records = df_top_wine.to_json(orient='records')
    list = json.loads(json_records)
    new_list = []
    for index, data in enumerate(list):
        info = {
            "id" : (index+1),
            "name" : data["WineName"],
            "title": "Primitivo di Manduria 2015",
            "thumb": data["ImageLink"],
            "detail": data["ImageLink"],
            "grade": data["AvgScore"],
            "ratings": data["ScoreCount"],
            "percent": 0,
            "flag": {
                "icon": "italy",
                "text": "Sicily, Italy"
            },
            "tags": [
                {"icon": "italy", "text": "Italy"},
                {"text": "Brunello di Montalcino"},
                {"text": "Banfi"},
                {"text": "Red wine"},
                {"text": "Sangiovese"}
            ],
            "range": [data["Light"], data["Smooth"], data["Dry"], data["Soft"]]
        }
        new_list.append(info)
    dict ={
        "lists" : new_list
    }
    return JsonResponse(dict)


def get_wine(request):
    print(request)
    va1 = request.GET.get('val')
    va2 = request.GET.get('va2')
    va3 = request.GET.get('va3')
    va4 = request.GET.get('va4')
    df_top_wine, df_image_lnk = WineRecommender.recommend(light=va1, smooth=va2, dry=va3, soft=va4, top=50, threshold=3)
    print(df_top_wine)
    data = pd.merge(df_top_wine, df_image_lnk,on='WineName')

    json_records = data.to_json(orient ='records')
    list = json.loads(json_records)
    new_list = []
    for index, data in enumerate(list):
        info = {
            "id" : (index+1),
            "name" : data["WineName"],
            "title": "Primitivo di Manduria 2015",
            "thumb": data["ImageLink"],
            "detail": data["ImageLink"],
            "grade": data["AvgScore"],
            "ratings": data["ScoreCount"],
            "percent": data["Similarity"],
            "flag": {
                "icon": "italy",
                "text": "Sicily, Italy"
            },
            "tags": [
                {"icon": "italy", "text": "Italy"},
                {"text": "Brunello di Montalcino"},
                {"text": "Banfi"},
                {"text": "Red wine"},
                {"text": "Sangiovese"}
            ],
            "range": [data["Light"], data["Smooth"], data["Dry"], data["Soft"]]
        }
        new_list.append(info)
    dict ={
        "lists" : new_list
    }
    return JsonResponse(dict)