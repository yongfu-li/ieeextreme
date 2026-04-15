#include <algorithm>
#include <iostream>
#include <numeric>
#include <utility>
#include <vector>

using namespace std;

static long long count_leq(const int n, const int p, const int q) {
    vector<long long> exact_count(n + 1, 0);
    for (int denominator = 1; denominator <= n; ++denominator) {
        exact_count[denominator] = (1LL * p * denominator) / q;
    }

    for (int d = 1; d <= n; ++d) {
        for (int multiple = d + d; multiple <= n; multiple += d) {
            exact_count[multiple] -= exact_count[d];
        }
    }

    long long total = 0;
    for (int denominator = 1; denominator <= n; ++denominator) {
        total += exact_count[denominator];
    }
    return total;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0;
    long long k = 0;
    cin >> n >> k;

    int left = 1;
    int right = n - 1;
    int best_x = n - 1;

    while (left <= right) {
        const int mid = (left + right) / 2;
        const long long rank = count_leq(n, mid, n);
        if (rank >= k) {
            best_x = mid;
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }

    const long long previous_rank = count_leq(n, best_x - 1, n);
    const long long need_inside_bucket = k - previous_rank;

    vector<pair<int, int>> bucket;
    bucket.reserve(n);

    for (int denominator = 1; denominator <= n; ++denominator) {
        const int numerator = static_cast<int>((1LL * best_x * denominator) / n);
        if (numerator <= 0 || numerator >= denominator) {
            continue;
        }
        if (1LL * numerator * n <= 1LL * (best_x - 1) * denominator) {
            continue;
        }
        if (gcd(numerator, denominator) != 1) {
            continue;
        }
        bucket.push_back({numerator, denominator});
    }

    sort(
        bucket.begin(),
        bucket.end(),
        [](const pair<int, int>& lhs, const pair<int, int>& rhs) {
            return 1LL * lhs.first * rhs.second < 1LL * rhs.first * lhs.second;
        }
    );

    const pair<int, int> answer = bucket[need_inside_bucket - 1];
    cout << answer.first << ' ' << answer.second << '\n';
    return 0;
}
