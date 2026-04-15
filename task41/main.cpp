#include <algorithm>
#include <iostream>
#include <vector>

using namespace std;

static constexpr long long MOD = 1000000007LL;

static long long mod_pow(long long base, long long exp) {
    long long result = 1LL;
    base %= MOD;
    while (exp > 0) {
        if (exp & 1LL) {
            result = (result * base) % MOD;
        }
        base = (base * base) % MOD;
        exp >>= 1LL;
    }
    return result;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0;
    cin >> n;

    vector<long long> a(n);
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
    }

    sort(a.begin(), a.end());

    vector<int> counts;
    for (int i = 0; i < n;) {
        int j = i;
        while (j < n && a[j] == a[i]) {
            ++j;
        }
        counts.push_back(j - i);
        i = j;
    }

    vector<long long> fact(n + 1, 1LL), inv_fact(n + 1, 1LL);
    for (int i = 1; i <= n; ++i) {
        fact[i] = (fact[i - 1] * i) % MOD;
    }
    inv_fact[n] = mod_pow(fact[n], MOD - 2);
    for (int i = n - 1; i >= 0; --i) {
        inv_fact[i] = (inv_fact[i + 1] * (i + 1)) % MOD;
    }

    const long long inv2 = mod_pow(2LL, MOD - 2);

    auto comb = [&](int nn, int kk) -> long long {
        if (kk < 0 || kk > nn) {
            return 0LL;
        }
        long long res = fact[nn];
        res = (res * inv_fact[kk]) % MOD;
        res = (res * inv_fact[nn - kk]) % MOD;
        return res;
    };

    long long answer = 1LL;
    int prefix = 0;

    for (int g = 0; g < static_cast<int>(counts.size()); ++g) {
        const int c = counts[g];
        prefix += c;

        // Internal eliminations among equal values:
        // f(c) = product_{k=2..c} C(k, 2) = c! * (c-1)! / 2^(c-1).
        long long internal = fact[c];
        internal = (internal * fact[c - 1]) % MOD;
        internal = (internal * mod_pow(inv2, c - 1)) % MOD;
        answer = (answer * internal) % MOD;

        // Cross-group interleavings with previous (smaller value) groups.
        if (g > 0) {
            answer = (answer * comb(prefix, c - 1)) % MOD;
        }
    }

    cout << answer << '\n';
    return 0;
}
