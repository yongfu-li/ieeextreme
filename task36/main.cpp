#include <algorithm>
#include <iostream>
#include <limits>
#include <vector>

using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0;
    cin >> n;

    vector<long long> values(n + 1, 0);
    for (int i = 1; i <= n; ++i) {
        cin >> values[i];
    }

    sort(values.begin() + 1, values.end(), greater<long long>());

    vector<long long> prefix(n + 1, 0);
    for (int i = 1; i <= n; ++i) {
        prefix[i] = prefix[i - 1] + values[i];
    }

    // f[i] = best Alex sum from suffix starting at i (Alex to move).
    vector<long long> f(n + 3, 0);
    const long long NEG_INF = numeric_limits<long long>::lowest() / 4;

    // suffix_max_g[i] = max over j>=i of (prefix[j] + f[j+2]).
    vector<long long> suffix_max_g(n + 3, NEG_INF);
    suffix_max_g[n + 1] = NEG_INF;
    suffix_max_g[n + 2] = NEG_INF;

    for (int i = n; i >= 1; --i) {
        const long long g_i = prefix[i] + f[i + 2];
        suffix_max_g[i] = max(g_i, suffix_max_g[i + 1]);
        f[i] = suffix_max_g[i] - prefix[i - 1];
    }

    cout << f[1] << '\n';
    return 0;
}
