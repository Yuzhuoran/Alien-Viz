import pandas as pd

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


if __name__ == '__main__':
    filter_color()