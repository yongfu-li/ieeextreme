#include <algorithm>
#include <iostream>
#include <limits>
#include <vector>

using namespace std;

class MaxSegmentTree {
public:
    explicit MaxSegmentTree(const vector<long long>& values) {
        int n_local = 1;
        while (n_local < static_cast<int>(values.size())) {
            n_local <<= 1;
        }
        n = n_local;
        tree.assign(2 * n, 0LL);
        for (int i = 0; i < static_cast<int>(values.size()); ++i) {
            tree[n + i] = values[i];
        }
        for (int i = n - 1; i >= 1; --i) {
            tree[i] = max(tree[2 * i], tree[2 * i + 1]);
        }
    }

    int first_at_least(int left, long long threshold) const {
        return first_at_least_impl(1, 0, n - 1, left, threshold);
    }

    int last_at_least(int right, long long threshold) const {
        return last_at_least_impl(1, 0, n - 1, right, threshold);
    }

private:
    int n = 0;
    vector<long long> tree;

    int first_at_least_impl(int node, int nl, int nr, int left, long long threshold) const {
        if (nr < left || tree[node] < threshold) {
            return -1;
        }
        if (nl == nr) {
            return nl;
        }
        const int mid = (nl + nr) / 2;
        int ans = first_at_least_impl(2 * node, nl, mid, left, threshold);
        if (ans != -1) {
            return ans;
        }
        return first_at_least_impl(2 * node + 1, mid + 1, nr, left, threshold);
    }

    int last_at_least_impl(int node, int nl, int nr, int right, long long threshold) const {
        if (nl > right || tree[node] < threshold) {
            return -1;
        }
        if (nl == nr) {
            return nl;
        }
        const int mid = (nl + nr) / 2;
        int ans = last_at_least_impl(2 * node + 1, mid + 1, nr, right, threshold);
        if (ans != -1) {
            return ans;
        }
        return last_at_least_impl(2 * node, nl, mid, right, threshold);
    }
};

static long long minimal_platform_cost(
    const vector<long long>& balls,
    const MaxSegmentTree* seg,
    long long l,
    long long r
) {
    const long long len = r - l;
    const long long x = l;
    const int m = static_cast<int>(balls.size());
    const int nxt = static_cast<int>(upper_bound(balls.begin(), balls.end(), x) - balls.begin());

    if (nxt == m) {
        // Window starts at or after the largest ball, so no strictly-inside ball exists.
        return 0LL;
    }

    const long long start_cur = (nxt == 0 ? numeric_limits<long long>::lowest() / 4 : balls[nxt - 1]);
    const long long end_cur = balls[nxt] - len;
    if (x <= end_cur && end_cur >= start_cur) {
        return 0LL;
    }

    long long left_best = balls[0] - len;  // Region before the first ball.
    if (end_cur >= start_cur) {
        left_best = max(left_best, end_cur);  // Current region's right boundary.
    }

    if (seg != nullptr && nxt >= 2) {
        // Find rightmost earlier gap with size >= len.
        const int gap_idx = seg->last_at_least(nxt - 2, len);
        if (gap_idx != -1) {
            left_best = max(left_best, balls[gap_idx + 1] - len);
        }
    }

    long long right_best = balls[m - 1];  // Region after last ball always feasible.
    if (seg != nullptr && nxt <= m - 2) {
        // Find leftmost later gap with size >= len.
        const int gap_idx = seg->first_at_least(nxt, len);
        if (gap_idx != -1) {
            right_best = min(right_best, balls[gap_idx]);
        }
    }

    return min(x - left_best, right_best - x);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0;
    int m = 0;
    cin >> n >> m;

    vector<pair<long long, long long>> platforms(n);
    for (int i = 0; i < n; ++i) {
        long long l = 0;
        long long r = 0;
        cin >> l >> r;
        platforms[i] = {l, r};
    }

    vector<long long> balls(m);
    for (int i = 0; i < m; ++i) {
        cin >> balls[i];
    }

    sort(balls.begin(), balls.end());
    balls.erase(unique(balls.begin(), balls.end()), balls.end());

    vector<long long> gaps;
    for (int i = 1; i < static_cast<int>(balls.size()); ++i) {
        gaps.push_back(balls[i] - balls[i - 1]);
    }
    MaxSegmentTree* seg = nullptr;
    MaxSegmentTree seg_storage(gaps);
    if (!gaps.empty()) {
        seg = &seg_storage;
    }

    long long answer = 0;
    for (const auto& [l, r] : platforms) {
        answer += minimal_platform_cost(balls, seg, l, r);
    }

    cout << answer << '\n';
    return 0;
}
