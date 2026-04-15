#include <algorithm>
#include <iostream>
#include <unordered_map>
#include <utility>
#include <vector>
using namespace std;

struct Edge { int x1, y1, x2, y2; bool vert; };

static inline long long num_at_x(const Edge& e, int x) {
    long long dx = 1LL * e.x2 - e.x1, dy = 1LL * e.y2 - e.y1, px = 1LL * x - e.x1;
    return 1LL * e.y1 * dx + dy * px; // y(x) * dx
}

static inline long long num_mid2(const Edge& e, int xl, int xr) {
    long long dx = 1LL * e.x2 - e.x1, dy = 1LL * e.y2 - e.y1;
    return 2LL * e.y1 * dx + dy * (1LL * xl + xr - 2LL * e.x1); // y((xl+xr)/2) * 2*dx
}

static inline bool on_seg(int x, int y, const Edge& e) {
    if (x < min(e.x1, e.x2) || x > max(e.x1, e.x2) || y < min(e.y1, e.y2) || y > max(e.y1, e.y2)) return false;
    long long ax = 1LL * e.x2 - e.x1, ay = 1LL * e.y2 - e.y1;
    long long bx = 1LL * x - e.x1, by = 1LL * y - e.y1;
    return ax * by - ay * bx == 0;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m; cin >> n >> m;
    vector<pair<int,int>> p(n);
    for (auto& v : p) cin >> v.first >> v.second;

    vector<Edge> edges; edges.reserve(n);
    vector<int> xs; xs.reserve(n);
    for (int i = 0; i < n; ++i) {
        auto [x1, y1] = p[i];
        auto [x2, y2] = p[(i + 1) % n];
        xs.push_back(x1);
        if (x1 < x2 || (x1 == x2 && y1 <= y2)) edges.push_back({x1, y1, x2, y2, x1 == x2});
        else edges.push_back({x2, y2, x1, y1, x1 == x2});
    }

    sort(xs.begin(), xs.end());
    xs.erase(unique(xs.begin(), xs.end()), xs.end());
    int xc = (int)xs.size();

    unordered_map<int,int> xid;
    xid.reserve(2 * xc + 7);
    for (int i = 0; i < xc; ++i) xid[xs[i]] = i;

    vector<vector<int>> stripe(max(0, xc - 1));
    for (int i = 0; i + 1 < xc; ++i) {
        int xl = xs[i], xr = xs[i + 1];
        auto& v = stripe[i];
        for (int id = 0; id < n; ++id) {
            const auto& e = edges[id];
            if (!e.vert && e.x1 < xr && e.x2 > xl) v.push_back(id);
        }
        sort(v.begin(), v.end(), [&](int a, int b) {
            long long L = num_mid2(edges[a], xl, xr) * (2LL * (edges[b].x2 - edges[b].x1));
            long long R = num_mid2(edges[b], xl, xr) * (2LL * (edges[a].x2 - edges[a].x1));
            return (L == R) ? (a < b) : (L < R);
        });
    }

    vector<vector<int>> line_edges(xc);
    vector<vector<pair<int,int>>> vertical_intervals(xc);
    for (int id = 0; id < n; ++id) {
        const auto& e = edges[id];
        if (e.vert) vertical_intervals[xid[e.x1]].push_back({min(e.y1, e.y2), max(e.y1, e.y2)});
        else {
            int l = xid[e.x1], r = xid[e.x2];
            for (int i = l; i <= r; ++i) line_edges[i].push_back(id);
        }
    }

    for (int i = 0; i < xc; ++i) {
        auto& iv = vertical_intervals[i];
        sort(iv.begin(), iv.end());
        vector<pair<int,int>> merged;
        for (auto [l, r] : iv) {
            if (merged.empty() || l > merged.back().second + 1) merged.push_back({l, r});
            else merged.back().second = max(merged.back().second, r);
        }
        iv.swap(merged);

        int x = xs[i];
        auto& v = line_edges[i];
        sort(v.begin(), v.end(), [&](int a, int b) {
            long long L = num_at_x(edges[a], x) * (edges[b].x2 - edges[b].x1);
            long long R = num_at_x(edges[b], x) * (edges[a].x2 - edges[a].x1);
            return (L == R) ? (a < b) : (L < R);
        });
    }

    long long ans = 0;
    for (int qi = 0; qi < m; ++qi) {
        int x, y; cin >> x >> y;
        bool boundary = false, inside = false;

        auto check_boundary_nonvert = [&](const vector<int>& vec) {
            int pos = (int)(lower_bound(vec.begin(), vec.end(), y, [&](int id, int yy) {
                return num_at_x(edges[id], x) < 1LL * yy * (edges[id].x2 - edges[id].x1);
            }) - vec.begin());

            for (int t = max(0, pos - 3); t < min((int)vec.size(), pos + 4); ++t) {
                int id = vec[t];
                if (num_at_x(edges[id], x) == 1LL * y * (edges[id].x2 - edges[id].x1) && on_seg(x, y, edges[id])) {
                    boundary = true;
                    return;
                }
            }
        };

        auto count_inside_from = [&](const vector<int>& vec) {
            int first_above = (int)(upper_bound(vec.begin(), vec.end(), y, [&](int yy, int id) {
                return 1LL * yy * (edges[id].x2 - edges[id].x1) < num_at_x(edges[id], x);
            }) - vec.begin());
            inside = (((int)vec.size() - first_above) & 1);
        };

        auto it = xid.find(x);
        if (it != xid.end()) {
            int ix = it->second;
            const auto& iv = vertical_intervals[ix];
            int l = 0, r = (int)iv.size() - 1;
            while (l <= r) {
                int md = (l + r) >> 1;
                if (y < iv[md].first) r = md - 1;
                else if (y > iv[md].second) l = md + 1;
                else { boundary = true; break; }
            }
            if (!boundary) check_boundary_nonvert(line_edges[ix]);
            if (!boundary) {
                int sid = (ix + 1 < xc) ? ix : (ix > 0 ? ix - 1 : -1);
                if (sid != -1) count_inside_from(stripe[sid]);
            }
        } else {
            auto up = upper_bound(xs.begin(), xs.end(), x);
            if (up != xs.begin() && up != xs.end()) {
                int sid = (int)(up - xs.begin()) - 1;
                check_boundary_nonvert(stripe[sid]);
                if (!boundary) count_inside_from(stripe[sid]);
            }
        }

        if (boundary || inside) ++ans;
    }

    cout << ans << '\n';
    return 0;
}
