#include <algorithm>
#include <cstdint>
#include <deque>
#include <iostream>
#include <string>
#include <utility>
#include <vector>
using namespace std;
using U64 = uint64_t;

static inline U64 mix1(U64 h, char c) { return (h ^ (U64)(c + 131)) * 1099511628211ULL; }
static inline U64 mix2(U64 h, char c) { return h * 1315423911ULL + (U64)(c + 911); }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0, m = 0;
    cin >> n >> m;
    vector<string> a(n);
    vector<pair<U64, U64>> rows(n), cols(m, {1469598103934665603ULL, 11400714819323198485ULL});

    vector<int> rr(n), rb(n), cr(m), cb(m), ar(n, 1), ac(m, 1), inr(n), inc(m);
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
        U64 h1 = 1469598103934665603ULL, h2 = 11400714819323198485ULL;
        for (int j = 0; j < m; ++j) {
            const char ch = a[i][j];
            h1 = mix1(h1, ch);
            h2 = mix2(h2, ch);
            cols[j].first = mix1(cols[j].first, ch);
            cols[j].second = mix2(cols[j].second, ch);
            if (ch == 'R') {
                ++rr[i];
                ++cr[j];
            } else {
                ++rb[i];
                ++cb[j];
            }
        }
        rows[i] = {h1, h2};
    }

    deque<pair<int, int>> q;
    for (int i = 0; i < n; ++i) if (rr[i] == 0 || rb[i] == 0) q.push_back({0, i}), inr[i] = 1;
    for (int j = 0; j < m; ++j) if (cr[j] == 0 || cb[j] == 0) q.push_back({1, j}), inc[j] = 1;

    int remr = n, remc = m;
    while (!q.empty()) {
        auto [t, id] = q.front();
        q.pop_front();
        if (t == 0) {
            if (!ar[id] || !(rr[id] == 0 || rb[id] == 0)) continue;
            ar[id] = 0;
            --remr;
            for (int j = 0; j < m; ++j) if (ac[j]) {
                if (a[id][j] == 'R') --cr[j]; else --cb[j];
                if (!inc[j] && (cr[j] == 0 || cb[j] == 0)) q.push_back({1, j}), inc[j] = 1;
            }
        } else {
            if (!ac[id] || !(cr[id] == 0 || cb[id] == 0)) continue;
            ac[id] = 0;
            --remc;
            for (int i = 0; i < n; ++i) if (ar[i]) {
                if (a[i][id] == 'R') --rr[i]; else --rb[i];
                if (!inr[i] && (rr[i] == 0 || rb[i] == 0)) q.push_back({0, i}), inr[i] = 1;
            }
        }
    }

    if (remr && remc) {
        cout << -1 << '\n';
        return 0;
    }

    auto best_freq = [](vector<pair<U64, U64>>& v) {
        sort(v.begin(), v.end());
        int best = 0, cur = 0;
        pair<U64, U64> last = {0, 0};
        for (int i = 0; i < (int)v.size(); ++i) {
            if (i == 0 || v[i] != last) cur = 1;
            else ++cur;
            last = v[i];
            if (cur > best) best = cur;
        }
        return best;
    };

    int mx = max(best_freq(rows), best_freq(cols));
    cout << (n + m - mx) << '\n';
    return 0;
}
