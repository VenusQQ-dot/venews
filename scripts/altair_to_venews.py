"""用 Python Altair 畫圖,產生可直接貼進 VeNews 文章的內容,並可選擇送到 /api/publish。

使用情境:財務/數據分析師在 Python 做完分析,想把圖表放進新聞稿,不必截圖。

安裝:
    pip install altair pandas

只產生 Markdown(印到螢幕,複製貼到 /admin 文章內容):
    python scripts/altair_to_venews.py

直接送出成「草稿」(需先在網站設定 PUBLISH_TOKEN):
    VENEWS_URL=https://你的網域 PUBLISH_TOKEN=xxxx python scripts/altair_to_venews.py --send

Windows PowerShell:
    $env:VENEWS_URL="https://你的網域"; $env:PUBLISH_TOKEN="xxxx"; python scripts/altair_to_venews.py --send
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

import altair as alt
import pandas as pd

# 網站端的單一圖表上限(lib/vegaSpec.ts 的 MAX_SPEC_BYTES),超過會顯示錯誤
MAX_SPEC_BYTES = 200 * 1024


def build_chart() -> alt.Chart:
    """範例:月營收與年增率。換成你自己的 DataFrame 即可。"""
    df = pd.DataFrame(
        {
            "月份": ["1月", "2月", "3月", "4月", "5月", "6月"],
            "營收(億元)": [182.3, 165.1, 201.7, 214.9, 230.4, 241.0],
        }
    )
    return (
        alt.Chart(df, title=alt.Title("上半年月營收", subtitle="單位:億元(示意資料)"))
        .mark_bar(cornerRadiusEnd=3)
        .encode(
            x=alt.X("月份:O", sort=None, axis=alt.Axis(labelAngle=0), title=None),
            y=alt.Y("營收(億元):Q"),
            tooltip=["月份", "營收(億元)"],
        )
        .properties(height=260, description="上半年各月營收長條圖,6 月最高 241 億元")
    )


def chart_block(chart: alt.Chart) -> str:
    """把 Altair 圖表轉成 VeNews 認得的 ```altair 區塊。"""
    spec = chart.to_json(indent=2)
    size = len(spec.encode("utf-8"))
    if size > MAX_SPEC_BYTES:
        raise ValueError(
            f"圖表規格 {size // 1024} KB 超過網站上限 {MAX_SPEC_BYTES // 1024} KB,"
            "請先在 pandas 彙總資料(groupby)再畫圖"
        )
    if '"url"' in spec:
        # 網站只接受 inline values,不允許外部資料網址
        raise ValueError("圖表使用了外部資料 URL,請改傳 DataFrame(inline values)")
    return f"```altair\n{spec}\n```"


def build_content(chart: alt.Chart) -> str:
    return "\n".join(
        [
            "上半年營收逐月成長,6 月創下單月新高。",
            "",
            "## 月營收走勢",
            "",
            chart_block(chart),
            "",
            "資料來源:公司月營收公告(示意資料)。",
        ]
    )


def send(title: str, summary: str, content: str) -> None:
    base = os.environ.get("VENEWS_URL", "").rstrip("/")
    token = os.environ.get("PUBLISH_TOKEN", "")
    if not base or not token:
        sys.exit("缺少環境變數 VENEWS_URL 或 PUBLISH_TOKEN")

    payload = {
        "title": title,
        "summary": summary,
        "content": content,
        "category": "finance",
        "author": "數據組",
        "read_mins": 3,
        "status": "draft",  # 一律先存草稿,到 /admin 確認後再發布
    }
    req = urllib.request.Request(
        f"{base}/api/publish",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print("送出成功:", resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        sys.exit(f"送出失敗 HTTP {e.code}:{e.read().decode('utf-8', 'replace')}")
    except urllib.error.URLError as e:
        sys.exit(f"連線失敗:{e.reason}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Altair 圖表 → VeNews 文章")
    parser.add_argument("--send", action="store_true", help="送到 /api/publish 存成草稿")
    args = parser.parse_args()

    content = build_content(build_chart())
    if args.send:
        send("上半年營收逐月成長 6 月創新高", "公司上半年營收逐月走高,6 月達 241 億元。", content)
    else:
        print(content)


if __name__ == "__main__":
    main()
