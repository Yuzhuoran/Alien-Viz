import pandas as pd
import numpy as np
import requests as re
import threading
import grequests as gre

from datetime import datetime

def main():
    colors = {'white', 'orange', 'red', 'green', 'blue', 'black', 'silver', 'yellow'}
    data = pd.read_csv("scrubbed.csv", dtype={}, low_memory=False)
    data['comments'] = data['comments'].astype('str')
    data['color'] = data['city']
    for i, row in data.iterrows():
        data.set_value(i, 'color', 'unknown')
        row_comments = row['comments']
        for comment in row_comments.split(" "):
            if comment in colors:
                data.set_value(i, 'color', comment)
                break

    data.to_csv('data_with_color.csv', sep=",")

def filter_color():
    data = pd.read_csv("data_with_color.csv", low_memory=False)
    selector = data['color'] != 'unknown'
    data[selector].to_csv("filter_color.csv", index=False)

def get_date_length():
    url = 'https://api.sunrise-sunset.org/json'
    data = pd.read_csv("data_with_color.csv", dtype={}, low_memory=False)
    data['datetime'] = data['datetime'].astype('str')
    data['daylength'] = data['datetime']
    params_list = []
    print (data.info())
    print (len(data))
    '''

    for i, row in data.iterrows():
        if i > 40:
            break
        try:
            temp = row['datetime'].split('/')
            month, day, year = temp[0], temp[1], temp[2].split(' ')[0]
            lat = float(row['latitude'])
            lng = float(row['longitude'])
            params = {
                'lat': lat,
                'lng': lng,
                'date': year + '-' + month + '-' + day
            }
            params_list.append(params)

        except (ValueError, IndexError) as e:
            data.set_value(i, 'daylength', 'date format invalid')
    '''
    '''
    reqs = (gre.get(url=url, params=p, stream=False) for p in params_list)
    print (reqs)
    result = []
    for p in params_list:
        rep = re.get(url=url, params=p)
        result.append(rep)

    print (result)
    '''


    '''
    result = gre.map(requests=reqs)
    index = 0
    for i, row in data.iterrows():
        if row['daylength'] == 'date format invalid':
            continue
        if index >= len(result):
            break

        if result[index] is None or result[index].status_code != 200:
            data.set_value(i, 'daylength', 'result invalid')
        else:
            data.set_value(i, 'daylength', result[index].json()['results']['day_length'])
            result[index].close()
        index += 1
    '''

    class request_thread(threading.Thread):
        def __init__(self, thread_id):
            threading.Thread.__init__(self)
            self.thread_id = thread_id

        def run(self):
            print ('start running!')
            start_index = self.thread_id * 8030
            end_index = start_index + 8029
            for i in range(start_index, end_index + 1):
                if i > len(data):
                    break
                row = data.iloc[i]
                try:
                    temp = row['datetime'].split('/')
                    month, day, year = temp[0], temp[1], temp[2].split(' ')[0]
                    lat = float(row['latitude'])
                    lng = float(row['longitude'])
                    params = {
                        'lat': lat,
                        'lng': lng,
                        'date': year + '-' + month + '-' + day
                    }
                    respond = re.get(url=url, params=params)
                    if respond.status_code == 200:
                        length = respond.json()['results']['day_length']
                        data.set_value(i, 'daylength', length)
                    else:
                        data.set_value(i, 'daylength', 'result invalid')
                except (ValueError, IndexError, re.RequestException, RuntimeError) as e:
                    data.set_value(i, 'daylength', 'format invalid')
                    print (e)

    threads = []
    for i in range(0, 10):
        re_thread = request_thread(i)
        re_thread.start()
        threads.append(re_thread)

    for t in threads:
        t.join()

    data.to_csv('data_with_length.csv', sep=",")


if __name__ == '__main__':
    get_date_length()




