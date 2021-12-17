import numpy as np
import pandas as pd

from typing import Tuple
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity

from winefinderapp.wine_finder_api.patterns.singleton import SingletonInstance
from winefinderapp.wine_finder_api.util.data_loader import WineDatasetLoader, WineImageLoader


class WineClusterer(SingletonInstance):
    def __init__(self):
        self._k_means = KMeans(n_clusters=4)
        self._fit_k_means_instance()

    def _determine_n_cluster(self):
        pass

    def _fit_k_means_instance(self):
        columns = ['Light', 'Smooth', 'Dry', 'Soft']
        X = WineDatasetLoader.instance().dataset[columns]
        wine_factors = X.values
        self._k_means.fit(wine_factors)
        WineDatasetLoader.instance().dataset['Cluster'] = self._k_means.labels_

    def predict_cluster(self, light, smooth, dry, soft):
        return self._k_means.predict(np.array([[light, smooth, dry, soft]]))


class WineRecommender:

    @staticmethod
    def search(name):
        # 와인 데이터 추출
        dataset = WineDatasetLoader.instance().dataset
        s = dataset.loc[:, 'WineName']
        s = s.str.contains(name, case=False, na=False)

        dataset = dataset.loc[s, :]

        # 와인 이미지 데이터 추출
        df_image_lnk = WineImageLoader.instance().dataset
        # 와인 이름이 동일한 와인 이미지만 추출
        df_image_lnk = df_image_lnk[df_image_lnk.WineName.isin(dataset.WineName)][['WineName', 'ImageLink']]
        # 와인 데이터, 와인 이미지 데이터 머지
        data = pd.merge(dataset, df_image_lnk, on='WineName')

        return data


    @staticmethod
    def top(count):
        # 와인 데이터 추출
        dataset = WineDatasetLoader.instance().dataset
        # 평점이 높은 순으로 정렬, count 만큼
        df_top_wine = dataset.sort_values(by=['AvgScore'], ascending=False)[:count]

        # 와인 이미지 데이터 추출
        df_image_lnk = WineImageLoader.instance().dataset
        # 와인 이름이 동일한 와인 이미지만 추출
        df_image_lnk = df_image_lnk[df_image_lnk.WineName.isin(df_top_wine.WineName)][['WineName', 'ImageLink']]

        # 와인 데이터, 와인 이미지 데이터 머지
        data = pd.merge(df_top_wine, df_image_lnk, on='WineName')

        return data

    @staticmethod
    def recommend(light, smooth, dry, soft, top=5, threshold=None) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        This method is performed by Content-based filtering (K-Means). You can get wines data and image link.
        :param light:
        :param smooth:
        :param dry:
        :param soft:
        :param top: Number of top wines.
        :param threshold: Cut-line of rating score.
        :return: dataframe of wines and image links
        """
        pd.set_option('display.max_columns', None)
        cluster = WineClusterer.instance().predict_cluster(light, smooth, dry, soft)[0]
        wine_dataset = WineDatasetLoader.instance().dataset
        wine_dataset = wine_dataset[wine_dataset.Cluster == cluster]
        wine_dataset = wine_dataset.sort_values(by=['ScoreCount', 'AvgScore'], ascending=False)

        if isinstance(threshold, (float, int)):
            wine_dataset = wine_dataset[wine_dataset.AvgScore >= threshold]

        df_top_wine: pd.DataFrame = wine_dataset.iloc[:top]

        wine_img_dataset = WineImageLoader.instance().dataset
        df_image_lnk = wine_img_dataset[wine_img_dataset.WineName.isin(df_top_wine.WineName)]

        def factors(df):
            for r, row in enumerate(df.iloc):
                yield r, np.array([[row.Light, row.Smooth, row.Dry, row.Soft]])

        pivot_vector = np.array([[light, smooth, dry, soft]])
        df_top_wine['Similarity'] = np.NaN
        for r, factor in factors(df_top_wine):
            row = list(df_top_wine.iloc[r].values)
            row[-1] = cosine_similarity(pivot_vector, factor) * 100
            df_top_wine.iloc[r] = row

        df_top_wine = df_top_wine.sort_values(by=['Similarity', 'AvgScore'], ascending=False)

        return df_top_wine, df_image_lnk
